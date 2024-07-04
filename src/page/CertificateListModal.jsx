import React, { useEffect, useState } from "react";
import { certificateList } from "./certificateData";
import toast from "react-hot-toast";

import { RxCross2 } from "react-icons/rx";
import apiService, {
  getEventParticipants,
  giveEventCertificate,
} from "../../../../../../../../../../api";
import { useParams } from "react-router-dom";
import { uploadMedia } from "../../../../../../../../reusable/uploadMedia";

const CertificateListModal = ({ onClose }) => {
  const [data, setData] = useState([]);

  console.log(data);
  const { id } = useParams();
  console.log(id);
  const [selectedCertificate, setSelectedCertificate] = useState("");

  const handleCertificateSelect = (certificate) => {
    setSelectedCertificate(certificate);
  };

  const [formData, setFormData] = useState([
    {
      participantId: "",
      certificate: "",
    },
  ]);

  const handleFileUpload = async (e, key) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    const mediaLink = await uploadMedia(formData);
  };

  const handleGenerateCertificate = async () => {
    try {
      const res = await apiService.post("organization/generateCertificate");
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleGiveCertificate = async () => {
    try {
      const updatedFormData = data.map((participant) => ({
        participantId: participant._id,
        certificate:
          "https://marketplace.canva.com/EAE5mV64ev4/1/0/1600w/canva-2FxMSYx2w58.jpg",
      }));
      console.log(updatedFormData);
      const requestData = { data: updatedFormData };
      const res = await giveEventCertificate(requestData);
      toast.success("Certificate given successfully");
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const closeModal = () => onClose();

  const getParticipants = async () => {
    try {
      const res = await getEventParticipants(id);
      console.log(res.data?.data);
      setData(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    getParticipants();
  }, []);

  return (
    <div className="p-8 relative">
      <div
        onClick={closeModal}
        className="float-right cursor-pointer absolute right-6 t"
      >
        <RxCross2 size={25} />
      </div>
      <div className="flex justify-between pt-10">
        <h1>Select Certificate</h1>
        <button
          onClick={handleGiveCertificate}
          className="px-4 py-1 bg-primary text-white rounded-xl"
        >
          Proceed to submit
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {certificateList.map((item) => (
          <div
            key={item.id}
            className={`border-2 rounded-md p-4 flex flex-col cursor-pointer items-center ${
              selectedCertificate && selectedCertificate.id === item.id
                ? "border-primary"
                : "border-gray-300"
            }`}
            onClick={() => handleCertificateSelect(item)}
          >
            <img src={item.image} alt="certificate" />
            <p className="mt-2">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificateListModal;
