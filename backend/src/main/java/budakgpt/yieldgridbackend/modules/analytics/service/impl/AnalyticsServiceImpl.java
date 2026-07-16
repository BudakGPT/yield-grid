package budakgpt.yieldgridbackend.modules.analytics.service.impl;

import budakgpt.yieldgridbackend.modules.analytics.repository.AnalyticsRepository;
import budakgpt.yieldgridbackend.modules.analytics.service.AnalyticsService;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {
    private final AnalyticsRepository analyticsRepository;

    public AnalyticsServiceImpl(AnalyticsRepository analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }
}
