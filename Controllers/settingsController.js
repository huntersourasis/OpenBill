import Settings from "../Modals/settingsModal.js";
import { sendHttpResponse } from "../Utils/httpResponse.js";
import {
    defaultCSM,
    defaultBTM,
    defaultURM,
    defaultSECM,
    defaultSYSM
} from "../Utils/settings.js";


const settingsReadController = async (req, res) => {
    try {
        const defaults = [
            defaultCSM,
            defaultBTM,
            defaultURM,
            defaultSECM,
            defaultSYSM
        ];

        for (const def of defaults) {
            await Settings.updateOne(
                { section: def.section },
                { $setOnInsert: def },
                { upsert: true }
            );
        }

        const settings = await Settings.find({});
        return res.status(200).json({ success: true, data: settings });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


const settingsUpdateController = async (req, res) => {
    try {
        const { section, data } = req.body;

        if (!section || !data) {
            return sendHttpResponse(res , 400 , false , "Section and data are required");
        }

        const updated = await Settings.findOneAndUpdate(
            { section },
            { $set: data },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Settings updated",
            data: updated
        });

    } catch (err) {
        return sendHttpResponse(res, 500 , false , err.message);
    }
};

export {
    settingsReadController,
    settingsUpdateController
};
