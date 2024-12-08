import {UserModel} from '../model/UserModel';

const API_URL = import.meta.env.VITE_API_URL; 
export const loginUser = async  (user:UserModel):Promise<UserModel>=>{
    const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data: any = await response.json();

      if (!response.ok) {
        return data
      }
    
      // Chuyển đổi phản hồi thành JSON và trả về đối tượng kiểu Hospital
      return data;  // Trả về đối tượng Hospital
}