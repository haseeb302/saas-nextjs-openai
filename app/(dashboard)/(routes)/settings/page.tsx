import Heading from "@/components/Heading";
import { Settings } from "lucide-react";

const SettingsPage = () => {
  return (
    <div>
      <Heading
        title="Setting"
        description="Manage Account Settings"
        icon={Settings}
        iconColor="text-gray-700"
        bgColor="bg-gray-700/10"
      />
    </div>
  );
};

export default SettingsPage;
