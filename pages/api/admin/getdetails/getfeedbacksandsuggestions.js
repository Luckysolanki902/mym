import connectToMongo from '@/middleware/middleware';
import UserForm from '@/models/UserForm';

const handler = async (req, res) => {
  try {
    const userForms = await UserForm.find({createdAt: -1}); // Fetch all user forms from the database
    res.status(200).json(userForms);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch user forms" });
  }
};

const getUserFormsHandler = connectToMongo(handler); // Apply the middleware

export default getUserFormsHandler;
