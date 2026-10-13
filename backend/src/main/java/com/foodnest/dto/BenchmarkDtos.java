package com.foodnest.dto;

import java.util.List;

public class BenchmarkDtos {

    public static class BenchmarkRunIteration {
        private int iteration;
        private long mongoLatencyMs;
        private long redisLatencyMs;

        public BenchmarkRunIteration() {}
        public BenchmarkRunIteration(int iteration, long mongoLatencyMs, long redisLatencyMs) {
            this.iteration = iteration;
            this.mongoLatencyMs = mongoLatencyMs;
            this.redisLatencyMs = redisLatencyMs;
        }

        public int getIteration() { return iteration; }
        public void setIteration(int iteration) { this.iteration = iteration; }
        public long getMongoLatencyMs() { return mongoLatencyMs; }
        public void setMongoLatencyMs(long mongoLatencyMs) { this.mongoLatencyMs = mongoLatencyMs; }
        public long getRedisLatencyMs() { return redisLatencyMs; }
        public void setRedisLatencyMs(long redisLatencyMs) { this.redisLatencyMs = redisLatencyMs; }
    }

    public static class BenchmarkResponse {
        private int iterations;
        private String targetData;
        private List<BenchmarkRunIteration> runs;
        private double avgMongoLatencyMs;
        private double avgRedisLatencyMs;
        private double latencyReductionPercentage;
        private long totalHits;
        private long totalMisses;

        public BenchmarkResponse() {}

        public int getIterations() { return iterations; }
        public void setIterations(int iterations) { this.iterations = iterations; }
        public String getTargetData() { return targetData; }
        public void setTargetData(String targetData) { this.targetData = targetData; }
        public List<BenchmarkRunIteration> getRuns() { return runs; }
        public void setRuns(List<BenchmarkRunIteration> runs) { this.runs = runs; }
        public double getAvgMongoLatencyMs() { return avgMongoLatencyMs; }
        public void setAvgMongoLatencyMs(double avgMongoLatencyMs) { this.avgMongoLatencyMs = avgMongoLatencyMs; }
        public double getAvgRedisLatencyMs() { return avgRedisLatencyMs; }
        public void setAvgRedisLatencyMs(double avgRedisLatencyMs) { this.avgRedisLatencyMs = avgRedisLatencyMs; }
        public double getLatencyReductionPercentage() { return latencyReductionPercentage; }
        public void setLatencyReductionPercentage(double latencyReductionPercentage) { this.latencyReductionPercentage = latencyReductionPercentage; }
        public long getTotalHits() { return totalHits; }
        public void setTotalHits(long totalHits) { this.totalHits = totalHits; }
        public long getTotalMisses() { return totalMisses; }
        public void setTotalMisses(long totalMisses) { this.totalMisses = totalMisses; }
    }
}
