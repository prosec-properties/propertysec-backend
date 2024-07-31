import axios from 'axios'


export const getGoogleUserProfile = async (accessToken: string) => {
    try {
      const response = await axios.get('https://www.googleapis.com/userinfo/v2/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
  
      return response.data
    } catch (error: any) {
      throw error.response || error
    }
  }