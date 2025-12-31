import Settings from "../Modals/settingsModal.js";
import {
    defaultCSM,
    defaultBTM,
    defaultURM,
    defaultSECM,
    defaultSYSM
} from "../Utils/settings.js";

/**
 * GET all settings (auto-create defaults if missing)
 */
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

/**
 * UPDATE settings by section
 */
const settingsUpdateController = async (req, res) => {
    try {
        const { section, data } = req.body;

        if (!section || !data) {
            return res.status(400).json({
                success: false,
                message: "Section and data are required"
            });
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
        return res.status(500).json({ success: false, message: err.message });
    }
};

export {
    settingsReadController,
    settingsUpdateController
};
