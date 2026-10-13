package com.foodnest.controller;

import com.foodnest.dto.BenchmarkDtos.BenchmarkResponse;
import com.foodnest.service.BenchmarkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/benchmark")
public class BenchmarkController {

    private final BenchmarkService benchmarkService;

    public BenchmarkController(BenchmarkService benchmarkService) {
        this.benchmarkService = benchmarkService;
    }

    /**
     * Triggers lab experiment benchmarking MongoDB query latency vs Redis cache hit latency.
     */
    @GetMapping("/run")
    public ResponseEntity<BenchmarkResponse> runBenchmark(
            @RequestParam(required = false, defaultValue = "10") int iterations) {
        return ResponseEntity.ok(benchmarkService.runBenchmark(iterations));
    }
}
