import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, getAuth } from "firebase/auth";
import { db } from "../firebaseConfig";

const OwnerProfile = ({ ownerId }: { ownerId: string }) => {
  const [profile, setProfile] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const docSnap = await getDoc(doc(db, "owners", ownerId));
      if (docSnap.exists()) setProfile(docSnap.data());
    };
    fetchProfile();
  }, [ownerId]);

  const handleUpdateProfile = async () => {
    try {
      await updateDoc(doc(db, "owners", ownerId), { ...profile });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Failed to update profile.");
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) return alert("Passwords do not match!");
    const user = getAuth().currentUser;
    if (user) {
      try {
        await updatePassword(user, newPassword);
        alert("Password updated!");
        setNewPassword(""); setConfirmPassword("");
      } catch (error) {
        alert("Failed to update password. Please log out and log in again.");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>
      
      {/* Profile Fields */}
      <div className="space-y-4">
        <input value={profile.companyName || ""} onChange={(e) => setProfile({...profile, companyName: e.target.value})} disabled={!isEditing} className="w-full p-3 border rounded-xl" />
        <input value={profile.email || ""} disabled className="w-full p-3 border rounded-xl bg-gray-50" />
        <input value={profile.phone || ""} onChange={(e) => setProfile({...profile, phone: e.target.value})} disabled={!isEditing} className="w-full p-3 border rounded-xl" />
        
        {isEditing && (
          <button onClick={handleUpdateProfile} className="w-full py-3 bg-green-600 text-white rounded-xl">Save Profile</button>
        )}
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="w-full py-3 bg-blue-600 text-white rounded-xl">Edit Profile</button>
        )}
      </div>

      {/* Password Section */}
      <div className="mt-8 pt-6 border-t">
        <h3 className="font-bold mb-4">Change Password</h3>
        <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 border rounded-xl mb-2" />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3 border rounded-xl" />
        <button onClick={handleUpdatePassword} className="mt-4 w-full py-3 bg-red-600 text-white rounded-xl">Update Password</button>
      </div>
    </div>
  );
};
export default OwnerProfile;