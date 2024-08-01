import axios from 'axios';
export const getGoogleUserProfile = async (accessToken) => {
    try {
        const response = await axios.get('https://www.googleapis.com/userinfo/v2/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;
    }
    catch (error) {
        throw error.response || error;
    }
};
//# sourceMappingURL=auth.js.map