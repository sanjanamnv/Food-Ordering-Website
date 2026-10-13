package com.foodnest.config;

import com.foodnest.model.*;
import com.foodnest.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Idempotent Database Seeder for MongoDB Atlas.
 * Populates 8 restaurants, 42 authentic food items, initial admin & customer, and coupons.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${foodnest.seeding.enabled:true}")
    private boolean seedingEnabled;

    public DataSeeder(UserRepository userRepository,
                      RestaurantRepository restaurantRepository,
                      FoodItemRepository foodItemRepository,
                      CouponRepository couponRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.foodItemRepository = foodItemRepository;
        this.couponRepository = couponRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!seedingEnabled) {
            log.info("Database seeding is disabled by configuration.");
            return;
        }

        seedUsers();
        seedCoupons();
        if (restaurantRepository.count() == 0) {
            seedRestaurantsAndFood();
        } else {
            log.info("Restaurants and food items already present in MongoDB. Skipping seed.");
        }
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@foodnest.com")) {
            User admin = new User(
                    "FoodNest Administrator",
                    "admin@foodnest.com",
                    passwordEncoder.encode("Admin@12345"),
                    "+91 9876543210",
                    Role.ADMIN
            );
            admin.getAddresses().add(new Address("101 Brigade Gateway", "Bengaluru", "Karnataka", "560055", "Near Orion Mall"));
            userRepository.save(admin);
            log.info("Seeded initial Admin: admin@foodnest.com");
        }

        if (!userRepository.existsByEmail("customer@foodnest.com")) {
            User customer = new User(
                    "Sanjana Rao",
                    "customer@foodnest.com",
                    passwordEncoder.encode("Customer@12345"),
                    "+91 9888877777",
                    Role.CUSTOMER
            );
            customer.getAddresses().add(new Address("42 Lakeview Enclave", "Hyderabad", "Telangana", "500081", "Opposite Cyber Towers"));
            userRepository.save(customer);
            log.info("Seeded sample Customer: customer@foodnest.com");
        }
    }

    private void seedCoupons() {
        if (couponRepository.count() == 0) {
            couponRepository.save(new Coupon("WELCOME50", "50% OFF up to ₹150 on your order", "PERCENTAGE", 50, 199, 150, true));
            couponRepository.save(new Coupon("TASTY20", "20% OFF up to ₹100 for foodies", "PERCENTAGE", 20, 149, 100, true));
            couponRepository.save(new Coupon("FLAT100", "Flat ₹100 instant discount on orders above ₹399", "FLAT", 100, 399, 100, true));
            log.info("Seeded 3 discount coupons into MongoDB.");
        }
    }

    private void seedRestaurantsAndFood() {
        log.info("Starting idempotent seeding for 8 restaurants and 42 food items...");

        // 1. Paradise Biryani Darbar
        Restaurant r1 = restaurantRepository.save(new Restaurant(
                "Paradise Biryani Darbar",
                "Authentic royal Hyderabadi dum biryani cooked in sealed handis with rich saffron and fragrant spices.",
                "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
                Arrays.asList("Biryani", "North Indian", "Mughlai"),
                4.8, 30, "Hyderabad"
        ));

        // 2. Punjabi Rasoi & Tandoor
        Restaurant r2 = restaurantRepository.save(new Restaurant(
                "Punjabi Rasoi & Tandoor",
                "Dhabha-style buttery curries, smokey clay oven tandoori breads, and homestyle dal makhani.",
                "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80",
                Arrays.asList("North Indian", "Tandoori", "Comfort Food"),
                4.6, 25, "New Delhi"
        ));

        // 3. Udupi Sri Krishna Bhavan
        Restaurant r3 = restaurantRepository.save(new Restaurant(
                "Udupi Sri Krishna Bhavan",
                "Crispy golden dosas, fluffy steamed idlis, hot filter coffee, and freshly ground coconut chutneys.",
                "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop&q=80",
                Arrays.asList("South Indian", "Vegetarian", "Healthy Food"),
                4.9, 20, "Bengaluru"
        ));

        // 4. Napoli Woodfired Pizzeria
        Restaurant r4 = restaurantRepository.save(new Restaurant(
                "Napoli Woodfired Pizzeria",
                "Hand-tossed sourdough pizzas with imported San Marzano tomatoes, fresh buffalo mozzarella, and aromatic basil.",
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
                Arrays.asList("Pizza", "Italian", "Fast Food"),
                4.7, 35, "Mumbai"
        ));

        // 5. Dragon Wok Asian House
        Restaurant r5 = restaurantRepository.save(new Restaurant(
                "Dragon Wok Asian House",
                "Sizzling Hakka noodles, Schezwan fried rice, dim sums, and spicy chilli garlic starters.",
                "https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&auto=format&fit=crop&q=80",
                Arrays.asList("Chinese", "Asian", "Quick Bites"),
                4.5, 25, "Kolkata"
        ));

        // 6. The Gourmet Burger Station
        Restaurant r6 = restaurantRepository.save(new Restaurant(
                "The Gourmet Burger Station",
                "Artisan brioche buns, smashed patties, melted cheddar, crispy onion rings, and handcrafted milkshakes.",
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
                Arrays.asList("Burgers", "American", "Fast Food"),
                4.6, 25, "Pune"
        ));

        // 7. Royal Shahi Mithai & Bakery
        Restaurant r7 = restaurantRepository.save(new Restaurant(
                "Royal Shahi Mithai & Bakery",
                "Warm gulab jamuns, saffron rasmalai, creamy cheesecakes, and artisanal dessert delights.",
                "https://images.unsplash.com/photo-1527772485170-7bcb05845722?w=800&auto=format&fit=crop&q=80",
                Arrays.asList("Desserts", "Bakery", "Beverages"),
                4.9, 20, "Jaipur"
        ));

        // 8. Vitality Greens & Cold Pressed
        Restaurant r8 = restaurantRepository.save(new Restaurant(
                "Vitality Greens & Cold Pressed",
                "Wholesome quinoa bowls, detox cold-pressed juices, protein salads, and clean plant-based fuel.",
                "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80",
                Arrays.asList("Healthy Food", "Salads", "Beverages"),
                4.7, 20, "Bengaluru"
        ));

        List<FoodItem> items = new ArrayList<>();

        // Items for Restaurant 1 (Paradise Biryani)
        items.add(new FoodItem(r1.getId(), r1.getName(), "Hyderabadi Chicken Dum Biryani",
                "Tender chicken pieces marinated overnight in freshly roasted spices and slow cooked with basmati rice in dum style.",
                "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
                299.0, "Biryani", "Indian", false, Arrays.asList("spicy", "comfort", "bestseller"), true));

        items.add(new FoodItem(r1.getId(), r1.getName(), "Shahi Paneer Dum Biryani",
                "Succulent cubes of fresh cottage cheese cooked in aromatic ghee, mint, caramelized onions, and basmati rice.",
                "https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=800&auto=format&fit=crop&q=80",
                269.0, "Biryani", "Indian", true, Arrays.asList("comfort", "vegetarian", "bestseller"), true));

        items.add(new FoodItem(r1.getId(), r1.getName(), "Mutton Galouti Kebab (4 pcs)",
                "Melt-in-mouth spiced minced mutton patties infused with cardamom, mace, and royal rose water.",
                "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80",
                349.0, "North Indian", "Indian", false, Arrays.asList("spicy", "comfort"), true));

        items.add(new FoodItem(r1.getId(), r1.getName(), "Mirchi Ka Salan & Raita Combo",
                "Traditional Hyderabadi peanut-sesame-coconut curry paired with chilled cumin raita.",
                "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
                99.0, "North Indian", "Indian", true, Arrays.asList("spicy", "budget", "vegetarian"), true));

        items.add(new FoodItem(r1.getId(), r1.getName(), "Special Egg Biryani",
                "Fragrant saffron basmati rice with two golden fried boiled eggs and aromatic masala.",
                "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80",
                219.0, "Biryani", "Indian", false, Arrays.asList("budget", "comfort"), true));

        // Items for Restaurant 2 (Punjabi Rasoi)
        items.add(new FoodItem(r2.getId(), r2.getName(), "Paneer Butter Masala",
                "Soft cottage cheese cooked in a rich, buttery tomato gravy with cream and fenugreek.",
                "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80",
                249.0, "North Indian", "Indian", true, Arrays.asList("comfort", "vegetarian", "bestseller"), true));

        items.add(new FoodItem(r2.getId(), r2.getName(), "Dal Makhani",
                "Black lentils slow-cooked overnight on charcoal fire with cream, butter, and mild spices.",
                "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
                199.0, "North Indian", "Indian", true, Arrays.asList("comfort", "vegetarian", "budget"), true));

        items.add(new FoodItem(r2.getId(), r2.getName(), "Butter Garlic Naan (2 pcs)",
                "Clay oven leavened bread brushed with melted butter and topped with roasted minced garlic.",
                "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&auto=format&fit=crop&q=80",
                79.0, "North Indian", "Indian", true, Arrays.asList("budget", "vegetarian", "quick"), true));

        items.add(new FoodItem(r2.getId(), r2.getName(), "Tandoori Chicken (Half)",
                "Tender chicken marinated in hung curd, Kashmiri red chilli, and roasted mustard oil, char-grilled.",
                "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80",
                289.0, "North Indian", "Indian", false, Arrays.asList("spicy", "bestseller"), true));

        items.add(new FoodItem(r2.getId(), r2.getName(), "Punjabi Chole with Bhature (2 pcs)",
                "Spiced Amritsari chickpeas served with puffy deep-fried fermented breads and pickled onions.",
                "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80",
                179.0, "North Indian", "Indian", true, Arrays.asList("comfort", "budget", "vegetarian"), true));

        // Items for Restaurant 3 (Udupi Sri Krishna)
        items.add(new FoodItem(r3.getId(), r3.getName(), "Mysore Masala Dosa",
                "Golden crispy rice-lentil crepe smeared with spicy red garlic chutney and stuffed with spiced potato mash.",
                "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop&q=80",
                129.0, "South Indian", "Indian", true, Arrays.asList("budget", "vegetarian", "quick", "bestseller"), true));

        items.add(new FoodItem(r3.getId(), r3.getName(), "Steamed Idli & Vada Combo",
                "Two pillowy steamed rice cakes and one crispy medu vada served with sambar and two coconut chutneys.",
                "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80",
                99.0, "South Indian", "Indian", true, Arrays.asList("budget", "healthy", "vegetarian", "quick"), true));

        items.add(new FoodItem(r3.getId(), r3.getName(), "Rava Onion Dosa",
                "Crispy semolina crepe studded with chopped green chillies, ginger, cumin, and fried onions.",
                "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=80",
                139.0, "South Indian", "Indian", true, Arrays.asList("vegetarian", "comfort"), true));

        items.add(new FoodItem(r3.getId(), r3.getName(), "Bisibelebath with Boondi",
                "Classic Karnataka spicy lentil-rice delicacy loaded with fresh vegetables, cashews, and pure ghee.",
                "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
                149.0, "South Indian", "Indian", true, Arrays.asList("comfort", "budget", "vegetarian"), true));

        items.add(new FoodItem(r3.getId(), r3.getName(), "Filter Coffee (Traditional Tumbler)",
                "Frothy, dark-roasted chicory decoction blended with steaming hot fresh full-cream milk.",
                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
                49.0, "Beverages", "Indian", true, Arrays.asList("quick", "budget", "vegetarian"), true));

        // Items for Restaurant 4 (Napoli Woodfired Pizzeria)
        items.add(new FoodItem(r4.getId(), r4.getName(), "Margherita Gourmet Pizza (11 inch)",
                "Hand-tossed sourdough crust topped with San Marzano tomato puree, fresh fior di latte mozzarella, and basil.",
                "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80",
                349.0, "Pizza", "Italian", true, Arrays.asList("comfort", "vegetarian", "bestseller"), true));

        items.add(new FoodItem(r4.getId(), r4.getName(), "Spicy Peri-Peri Paneer Pizza",
                "Spicy marinated paneer cubes, roasted bell peppers, red paprika, and stretchy mozzarella.",
                "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
                389.0, "Pizza", "Italian", true, Arrays.asList("spicy", "comfort", "vegetarian"), true));

        items.add(new FoodItem(r4.getId(), r4.getName(), "Smokey BBQ Chicken Feast Pizza",
                "Smoked chicken chunks, caramelised red onions, jalapenos, and smokey hickory barbecue glaze.",
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
                429.0, "Pizza", "Italian", false, Arrays.asList("comfort", "bestseller"), true));

        items.add(new FoodItem(r4.getId(), r4.getName(), "Cheesy Garlic Breadsticks",
                "Freshly baked breadsticks stuffed with molten mozzarella, oregano, and garlic butter dip.",
                "https://images.unsplash.com/photo-1619895092538-128341789043?w=800&auto=format&fit=crop&q=80",
                159.0, "Pizza", "Italian", true, Arrays.asList("quick", "budget", "vegetarian"), true));

        items.add(new FoodItem(r4.getId(), r4.getName(), "Penne Arbiata Pasta",
                "Al dente penne tossed in fiery plum tomato sauce, garlic, extra virgin olive oil, and parmesan.",
                "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=800&auto=format&fit=crop&q=80",
                269.0, "Italian", "Italian", true, Arrays.asList("spicy", "vegetarian"), true));

        // Items for Restaurant 5 (Dragon Wok Asian House)
        items.add(new FoodItem(r5.getId(), r5.getName(), "Chilli Garlic Hakka Noodles",
                "Wok-tossed noodles with shredded bell peppers, cabbage, spring onions, and spicy chilli garlic paste.",
                "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80",
                189.0, "Chinese", "Chinese", true, Arrays.asList("spicy", "quick", "budget", "vegetarian"), true));

        items.add(new FoodItem(r5.getId(), r5.getName(), "Veg Schezwan Fried Rice",
                "Aromatic long grain rice tossed with crisp farm vegetables and authentic Sichuan pepper paste.",
                "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80",
                179.0, "Chinese", "Chinese", true, Arrays.asList("spicy", "budget", "vegetarian"), true));

        items.add(new FoodItem(r5.getId(), r5.getName(), "Crispy Chilli Paneer Dry",
                "Wok-crisped paneer cubes tossed with soy sauce, bell peppers, green chillies, and ginger.",
                "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80",
                219.0, "Chinese", "Chinese", true, Arrays.asList("spicy", "quick", "vegetarian", "bestseller"), true));

        items.add(new FoodItem(r5.getId(), r5.getName(), "Chicken Manchurian Gravy",
                "Tender chicken dumplings simmered in a dark soy, ginger, coriander, and scallion reduction.",
                "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&auto=format&fit=crop&q=80",
                249.0, "Chinese", "Chinese", false, Arrays.asList("comfort", "spicy"), true));

        items.add(new FoodItem(r5.getId(), r5.getName(), "Steamed Veg Dim Sums (6 pcs)",
                "Translucent steamed dumplings stuffed with water chestnuts, carrots, and mushrooms, served with chilli dip.",
                "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&auto=format&fit=crop&q=80",
                169.0, "Chinese", "Chinese", true, Arrays.asList("healthy", "quick", "vegetarian"), true));

        // Items for Restaurant 6 (The Gourmet Burger Station)
        items.add(new FoodItem(r6.getId(), r6.getName(), "Crispy Veg Maharaja Burger",
                "Double crispy spiced vegetable and corn patty with melted cheddar, tangy sauce, and pickled jalapeños.",
                "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80",
                169.0, "Burgers", "American", true, Arrays.asList("comfort", "budget", "vegetarian", "bestseller"), true));

        items.add(new FoodItem(r6.getId(), r6.getName(), "Fiery Crispy Chicken Burger",
                "Golden batter-fried chicken breast tossed in Louisiana hot sauce with creamy coleslaw and pickles.",
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
                219.0, "Burgers", "American", false, Arrays.asList("spicy", "comfort", "bestseller"), true));

        items.add(new FoodItem(r6.getId(), r6.getName(), "Peri-Peri Crinkle Fries",
                "Crispy crinkle cut potato fries tossed in fiery African bird's eye spice mix.",
                "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop&q=80",
                99.0, "Burgers", "American", true, Arrays.asList("spicy", "quick", "budget", "vegetarian"), true));

        items.add(new FoodItem(r6.getId(), r6.getName(), "Belgian Chocolate Thick Shake",
                "Rich dark chocolate ganache blended with creamy vanilla ice cream and crushed oreos.",
                "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80",
                149.0, "Beverages", "American", true, Arrays.asList("sweet", "comfort", "vegetarian"), true));

        // Items for Restaurant 7 (Royal Shahi Mithai)
        items.add(new FoodItem(r7.getId(), r7.getName(), "Hot Saffron Gulab Jamun (2 pcs)",
                "Soft khoya dumplings deep fried to mahogany gold and soaked in cardamom and saffron infused sugar syrup.",
                "https://images.unsplash.com/photo-1589119908995-c6837fa14d48?w=800&auto=format&fit=crop&q=80",
                79.0, "Desserts", "Indian", true, Arrays.asList("sweet", "comfort", "budget", "vegetarian", "bestseller"), true));

        items.add(new FoodItem(r7.getId(), r7.getName(), "Rasmalai in Pistachio Rabdi (2 pcs)",
                "Delicate chenna patties soaked in chilled condensed saffron milk topped with slivered almonds and pistachios.",
                "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80",
                99.0, "Desserts", "Indian", true, Arrays.asList("sweet", "comfort", "vegetarian"), true));

        items.add(new FoodItem(r7.getId(), r7.getName(), "Warm Moong Dal Halwa",
                "Slow-roasted yellow lentils cooked in pure desi ghee, saffron milk, and garnished with roasted cashews.",
                "https://images.unsplash.com/photo-1605197154245-2d4ff9eb2581?w=800&auto=format&fit=crop&q=80",
                129.0, "Desserts", "Indian", true, Arrays.asList("sweet", "comfort", "vegetarian"), true));

        items.add(new FoodItem(r7.getId(), r7.getName(), "New York Baked Cheesecake Slice",
                "Velvety cream cheese filling on a buttery graham cracker crust topped with blueberry compote.",
                "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop&q=80",
                189.0, "Desserts", "Continental", true, Arrays.asList("sweet", "vegetarian"), true));

        // Items for Restaurant 8 (Vitality Greens)
        items.add(new FoodItem(r8.getId(), r8.getName(), "Mediterranean Quinoa & Avocado Bowl",
                "Fluffy organic quinoa, avocado slices, cherry tomatoes, cucumbers, kalamata olives, and lemon tahini dressing.",
                "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80",
                269.0, "Healthy Food", "Continental", true, Arrays.asList("healthy", "vegetarian", "bestseller"), true));

        items.add(new FoodItem(r8.getId(), r8.getName(), "Grilled Paneer Protein Salad",
                "Herb-marinated grilled cottage cheese cubes tossed with bell peppers, baby spinach, and mint lime vinaigrette.",
                "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
                229.0, "Healthy Food", "Indian", true, Arrays.asList("healthy", "vegetarian"), true));

        items.add(new FoodItem(r8.getId(), r8.getName(), "Cold-Pressed ABC Immunity Booster Juice",
                "Fresh Apple, Beetroot, Carrot with ginger and lemon. Zero added sugar or preservatives.",
                "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80",
                119.0, "Beverages", "Healthy", true, Arrays.asList("healthy", "quick", "budget", "vegetarian"), true));

        items.add(new FoodItem(r8.getId(), r8.getName(), "Almond Berry Smoothie Bowl",
                "Thick smoothie of blueberries and Greek yogurt topped with chia seeds, granola, and sliced almonds.",
                "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop&q=80",
                199.0, "Healthy Food", "Healthy", true, Arrays.asList("healthy", "sweet", "vegetarian"), true));

        // Save all food items in MongoDB
        foodItemRepository.saveAll(items);
        log.info("Successfully seeded {} authentic food items into MongoDB Atlas.", items.size());
    }
}
