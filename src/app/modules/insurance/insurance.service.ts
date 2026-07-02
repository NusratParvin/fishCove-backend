import { GoogleGenAI } from '@google/genai';
import { InsuranceProvider } from './insurance.model';
import { TInsuranceProvider } from './insurance.interface';
import config from '../../config';
import { COVERAGE_TYPES, PET_TYPES } from './insurance.constants';

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

  // Avg coverage score across all providers
  const avgCoverageScore = totalProviders
    ? providers.reduce((sum, p) => sum + (p.coverageScore || 0), 0) /
      totalProviders
    : 0;

  // Avg rating, only counting providers that actually have reviews
  const ratedProviders = providers.filter((p) => p.reviewCount > 0);
  const avgRating = ratedProviders.length
    ? ratedProviders.reduce((sum, p) => sum + (p.avgRating || 0), 0) /
      ratedProviders.length
    : 0;

  // How many providers cover each pet type (mirrors "Clinics by Emirate")
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

  // How many providers cover each coverage flag (mirrors "Speciality Coverage")
  const coverageCounts: Record<string, number> = {};
  COVERAGE_TYPES.forEach((type) => (coverageCounts[type] = 0));
  providers.forEach((p) => {
    (p.coverageFlags || []).forEach((flag) => {
      coverageCounts[flag] = (coverageCounts[flag] || 0) + 1;
    });
  });
  const coverageDistribution = COVERAGE_TYPES.map((type) => {
    const count = coverageCounts[type];
    const percent = totalProviders ? (count / totalProviders) * 100 : 0;

    let status: 'wellCovered' | 'moderate' | 'limited';
    if (percent >= WELL_COVERED_THRESHOLD) status = 'wellCovered';
    else if (percent >= MODERATE_THRESHOLD) status = 'moderate';
    else status = 'limited';

    return {
      type,
      count,
      percent: Math.round(percent),
      status,
    };
  }).sort((a, b) => b.count - a.count);

  return {
    totalProviders,
    avgCoverageScore: Math.round(avgCoverageScore * 10) / 10,
    avgRating: Math.round(avgRating * 10) / 10,
    petDistribution,
    coverageDistribution,
  };
};

export const InsuranceService = {
  getAllProviders,
  getProviderById,
  createProvider,
  updateProvider,
  deleteProvider,
  getAIRecommendation,
  getDashboardStatsFromDB,
};
