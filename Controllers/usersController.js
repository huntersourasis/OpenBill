import bcrypt from 'bcrypt';
import { User } from "../Modals/userModal.js";
import { sendHttpResponse } from '../Utils/httpResponse.js';

const createUserController = async (req, res) => {
    try {
        const { fullname, email, role, password, status } = req.body;

        if (!fullname || !email || !role || !password || status === undefined) {
            return sendHttpResponse(res, 400, false, "JSON is not sufficient");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendHttpResponse(res, 409, false, "User already exists");
        }

        if(role === 'admin')
        {
            return sendHttpResponse(res , 401 , false , "Operation is not permitted.");
        }

        const hashedPass = await bcrypt.hash(password, 10);

        const user = new User({
            fullname,
            email,
            role,
            password: hashedPass,
            status
        });

        await user.save();
        return sendHttpResponse(res, 201, true, "User created successfully");

    } catch (error) {
        console.error(error);
        return sendHttpResponse(res, 500, false, "Internal server error");
    }
};

const readUserController = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        return sendHttpResponse(res, 200, true, "Users fetched successfully", users);
    } catch (error) {
        console.error(error);
        return sendHttpResponse(res, 500, false, "Internal server error");
    }
};

const updateUserController = async (req, res) => {
    try {
        const {id, fullname, email, role, password, status } = req.body;

        const isEmailExist = await User.findOne({email});


        const user = await User.findById(id);
        if (!user) {
            return sendHttpResponse(res, 404, false, "User not found");
        }

        if(isEmailExist && user.email != email)
        {
            return sendHttpResponse(res , 401 , false , "Email is alreay acquried")
        }

        if (email) user.email = email; 
        if (fullname) user.fullname = fullname;
        if (role) user.role = role;
        if (status !== undefined) user.status = status;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        return sendHttpResponse(res, 200, true, `${fullname} updated successfully`);

    } catch (error) {
        console.error(error);
        return sendHttpResponse(res, 500, false, "Internal server error");
    }
};

const deleteUserController = async (req, res) => {
    try {
        const { id } = req.body;

        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) {
            return sendHttpResponse(res, 404, false, "User not found");
        }

        return sendHttpResponse(res, 200, true, "User deleted successfully");

    } catch (error) {
        console.error(error);
        return sendHttpResponse(res, 500, false, "Internal server error");
    }
};


const userStatusController = async (req, res) => {
    try {
        const { id } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return sendHttpResponse(res, 404, false, "User not found");
        }

        user.status = !user.status;
        await user.save();

        return sendHttpResponse(
            res,
            200,
            true,
            `User ${user.status ? "activated" : "deactivated"} successfully`
        );

    } catch (error) {
        console.error(error);
        return sendHttpResponse(res, 500, false, "Internal server error");
    }
};

export {
    createUserController,
    readUserController,
    updateUserController,
    deleteUserController,
    userStatusController
};
