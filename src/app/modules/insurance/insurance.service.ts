/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenAI } from '@google/genai';
import { InsuranceProvider } from './insurance.model';
import { TInsuranceProvider } from './insurance.interface';
import config from '../../config';
import { COVERAGE_TYPES, PET_TYPES } from './insurance.constants';
import { InsuranceRecommendationLog } from './Insurancerecommendationlog.model';
import { InsuranceReview } from '../insuranceReview/insuranceReview.model';

const gemini = new GoogleGenAI({ apiKey: config.gemini_api_key });

const getAllProviders = async () => {
  return await InsuranceProvider.find().sort({ createdAt: -1 });
};

const getProviderById = async (id: string) => {
  return await InsuranceProvider.findById(id);
};

const createProvider = async (payload: TInsuranceProvider) => {
  return await InsuranceProvider.create(payload);
};

const updateProvider = async (
  id: string,
  payload: Partial<TInsuranceProvider>,
) => {
  return await InsuranceProvider.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

const deleteProvider = async (id: string) => {
  return await InsuranceProvider.findByIdAndDelete(id);
};

const getAIRecommendation = async (formData: {
  petName: string;
  species: string;
  breed: string;
  ageYears: string;
  existingConditions: string;
  budget: string;
}) => {
  const providers = await InsuranceProvider.find();

  const providerSummary = providers
    .map(
      (p) =>
        `- ${p.name}: AED ${p.priceFrom}–${p.priceTo}/mo, covers ${p.coverageFlags.join(', ')}, score ${p.coverageScore}%, pets: ${p.pets.join('/')}`,
    )
    .join('\n');

  const prompt = `
You are a UAE pet insurance expert. Based on the pet details below, recommend the best insurance provider from the list.

Pet Details:
- Name: ${formData.petName}
- Species: ${formData.species}
- Breed: ${formData.breed}
- Age: ${formData.ageYears} years
- Existing conditions: ${formData.existingConditions}
- Monthly budget: ${formData.budget} (low=AED 90–150, medium=AED 150–250, high=AED 250+)

Available UAE Providers:
${providerSummary}

Respond ONLY with a valid JSON object (no markdown, no backticks):
{
  "topProvider": "Provider Name",
  "recommendation": "One-sentence recommendation",
  "reasoning": "2–3 sentence explanation of why this provider fits",
  "tips": ["tip 1", "tip 2", "tip 3"]
}
`.trim();

  const response = await gemini.models.generateContent({
    model: 'gemini-3-flash-preview',
    config: { responseMimeType: 'application/json' },
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  });

  const text = response.text;
  // console.log(text);
  if (!text) {
    throw new Error('Empty Gemini response');
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(text);

    throw new Error('Invalid JSON response from Gemini');
  }
};

const WELL_COVERED_THRESHOLD = 60; // >= 60% of providers offer it
const MODERATE_THRESHOLD = 35; // >= 35% of providers offer it, else "limited"

const getDashboardStatsFromDB = async () => {
  const providers = await InsuranceProvider.find().lean();
  const totalProviders = providers.length;

  // Providers added this calendar month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const newThisMonth = providers.filter(
    (p: any) => p.createdAt && p.createdAt >= startOfMonth,
  ).length;

  const avgCoverageScore = totalProviders
    ? providers.reduce((sum, p) => sum + (p.coverageScore || 0), 0) /
      totalProviders
    : 0;

  const ratedProviders = providers.filter((p) => p.reviewCount > 0);
  const avgRating = ratedProviders.length
    ? ratedProviders.reduce((sum, p) => sum + (p.avgRating || 0), 0) /
      ratedProviders.length
    : 0;

  // Coverage counts, same as the dashboard stats above
  const coverageCounts: Record<string, number> = {};
  COVERAGE_TYPES.forEach((type) => (coverageCounts[type] = 0));
  providers.forEach((p) => {
    (p.coverageFlags || []).forEach((flag) => {
      coverageCounts[flag] = (coverageCounts[flag] || 0) + 1;
    });
  });

  // Worst 2 coverage types = lowest provider counts
  const biggestGaps = COVERAGE_TYPES.map((type) => ({
    type,
    count: coverageCounts[type],
  }))
    .sort((a, b) => a.count - b.count)
    .slice(0, 2)
    .map((g) => ({
      type: g.type,
      count: g.count,
      total: totalProviders,
    }));

  // Top rated provider (must have at least one review to count)
  const topRated = ratedProviders.sort((a, b) => b.avgRating - a.avgRating)[0];

  const zeroReviewCount = providers.filter((p) => p.reviewCount === 0).length;

  // AI recommendation concentration (bias check)
  const recommendationCounts = await InsuranceRecommendationLog.aggregate([
    { $group: { _id: '$topProvider', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const totalRecommendations = recommendationCounts.reduce(
    (sum, r) => sum + r.count,
    0,
  );
  const topRecommended = recommendationCounts[0];
  const topRecommendedPct =
    totalRecommendations && topRecommended
      ? Math.round((topRecommended.count / totalRecommendations) * 100)
      : 0;

  // console.log('service is getting hit');
  return {
    totalProviders,
    newThisMonth,
    avgCoverageScore: Math.round(avgCoverageScore),
    avgRating: Math.round(avgRating * 10) / 10,
    biggestGaps,
    topRated: topRated
      ? { name: topRated.name, avgRating: topRated.avgRating }
      : null,
    zeroReviewCount,
    aiRecommendation:
      totalRecommendations === 0
        ? { status: 'noData', count: 0 }
        : totalRecommendations < 5
          ? { status: 'warmingUp', count: totalRecommendations }
          : {
              status: topRecommendedPct >= 40 ? 'flagged' : 'healthy',
              topProvider: topRecommended._id,
              percent: topRecommendedPct,
              count: totalRecommendations,
            },
  };
};

const getCoverageCounts = (providers: any[]) => {
  const counts: Record<string, number> = {};
  COVERAGE_TYPES.forEach((type) => (counts[type] = 0));
  providers.forEach((p) => {
    (p.coverageFlags || []).forEach((flag: string) => {
      counts[flag] = (counts[flag] || 0) + 1;
    });
  });
  return counts;
};

const getAIRecommendationSummary = async () => {
  const breakdown = await InsuranceRecommendationLog.aggregate([
    { $group: { _id: '$topProvider', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const total = breakdown.reduce((sum, r) => sum + r.count, 0);
  return { breakdown, total };
};

const getDomainStats = async () => {
  const providers = await InsuranceProvider.find().lean();
  const totalProviders = providers.length;

  const avgCoverageScore = totalProviders
    ? providers.reduce((sum, p) => sum + (p.coverageScore || 0), 0) /
      totalProviders
    : 0;

  const ratedProviders = providers.filter((p) => p.reviewCount > 0);
  const avgRating = ratedProviders.length
    ? ratedProviders.reduce((sum, p) => sum + (p.avgRating || 0), 0) /
      ratedProviders.length
    : 0;

  // Full coverage type breakdown (all 10 types) — the main gap chart
  const coverageCounts = getCoverageCounts(providers);
  const coverageDistribution = COVERAGE_TYPES.map((type) => {
    const count = coverageCounts[type];
    const percent = totalProviders ? (count / totalProviders) * 100 : 0;
    let status: 'wellCovered' | 'moderate' | 'limited';
    if (percent >= WELL_COVERED_THRESHOLD) status = 'wellCovered';
    else if (percent >= MODERATE_THRESHOLD) status = 'moderate';
    else status = 'limited';
    return { type, count, percent: Math.round(percent), status };
  }).sort((a, b) => a.count - b.count); // worst gap first

  // Pet type breakdown
  const petCounts: Record<string, number> = {};
  PET_TYPES.forEach((pet) => (petCounts[pet] = 0));
  providers.forEach((p) => {
    (p.pets || []).forEach((pet) => {
      petCounts[pet] = (petCounts[pet] || 0) + 1;
    });
  });
  const petDistribution = PET_TYPES.map((pet) => ({
    pet,
    count: petCounts[pet],
  })).sort((a, b) => b.count - a.count);

  // Review velocity — last 8 weeks
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 8 * 7);
  const weeklyReviews = await InsuranceReview.aggregate([
    { $match: { createdAt: { $gte: eightWeeksAgo } } },
    {
      $group: {
        _id: { $dateTrunc: { date: '$createdAt', unit: 'week' } },
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  const totalReviews = await InsuranceReview.countDocuments();

  // AI recommendation — full spread across every provider
  const { breakdown: aiBreakdown, total: totalRecommendations } =
    await getAIRecommendationSummary();

  // Quality flags — providers with missing/incomplete data
  const qualityFlags = providers
    .map((p) => {
      const issues: string[] = [];
      if (!p.logo) issues.push('Missing logo');
      if (!p.plans?.length) issues.push('No plans listed');
      if (!p.highlights?.length) issues.push('No highlights');
      if (!p.coveredConditions?.length) issues.push('No covered conditions');
      if (p.reviewCount === 0) issues.push('No reviews yet');
      return { id: p._id, name: p.name, issues };
    })
    .filter((p) => p.issues.length > 0);

  return {
    totalProviders,
    avgCoverageScore: Math.round(avgCoverageScore * 10) / 10,
    avgRating: Math.round(avgRating * 10) / 10,
    coverageDistribution,
    petDistribution,
    reviewVelocity: {
      totalReviews,
      weekly: weeklyReviews.map((w) => ({
        week: w._id,
        count: w.count,
        avgRating: Math.round(w.avgRating * 10) / 10,
      })),
    },
    aiRecommendation: {
      total: totalRecommendations,
      providers: aiBreakdown.map((r) => ({
        provider: r._id,
        count: r.count,
        percent: totalRecommendations
          ? Math.round((r.count / totalRecommendations) * 100)
          : 0,
      })),
    },
    qualityFlags: {
      flaggedCount: qualityFlags.length,
      flagged: qualityFlags,
    },
  };
};

const getAllProvidersForAdmin = async () => {
  return await InsuranceProvider.find().sort({ createdAt: -1 });
};

export const InsuranceService = {
  getAllProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
  getAIRecommendation,
  getDashboardStatsFromDB,
  getDomainStats,
  getAllProvidersForAdmin,
};
