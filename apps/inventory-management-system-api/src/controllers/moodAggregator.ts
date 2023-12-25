import MomentModel from '../models/momentModel';  // Update the import path as per your directory structure

const getCoordinates = async (countryName) => {
  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${countryName}&key=${apiKey}`);
    
  const data = await response.json();
  console.log(`Response for ${countryName}:`, data);

  return !!data.results[0];
};

export async function getAggregatedData() {
  const pipeline = [
    {
      $match: { postType: 'global' } // This will filter out all documents that don't have 'postType' set to 'global'
    },
    {
      $group: {
        _id: "$location.country",
        averageMood: { $avg: "$moodScore" },
        count: { $sum: 1 }
      }
    }
  ];

  try {
    const agg = MomentModel.aggregate(pipeline);
    agg.options = { allowDiskUse: true, maxTimeMS: 60000 };  // 60 seconds
    const aggregatedData = await agg.exec();
    
    // Log the aggregated data for debugging
    console.log("Line32: Aggregated Data:", aggregatedData);
    // Filter out invalid countries/moods
    const validatedData = [];
    for (const entry of aggregatedData) {
      const isValid = await getCoordinates(entry._id);
      if (isValid) {
        validatedData.push(entry);
      }
    }
    
    console.log("Validated Aggregated Data: ", validatedData);
    return validatedData;

  } catch (error) {
    console.error("Error aggregating data: ", error);
    throw error;
  }
}
