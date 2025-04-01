import api from './axiosConfig';

export const useWaterIntakeAPI = () => {
  // Get water intake for a specific date
  const getUserWaterIntakeByDate = async (date) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const response = await api.get(`/water-intake?userId=${userId}&date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching water intake data:', error);
      return { amount: 0 }; // Return default value if error
    }
  };

  // Create or update water intake
  const saveWaterIntake = async (amount, date) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const payload = {
        userId: parseInt(userId),
        amount: amount,
        date: date
      };
      
      const response = await api.post('/water-intake', payload);
      return response.data;
    } catch (error) {
      console.error('Error saving water intake:', error);
      throw error;
    }
  };

  return {
    getUserWaterIntakeByDate,
    saveWaterIntake
  };
};

export default useWaterIntakeAPI;