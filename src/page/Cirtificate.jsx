import { AiFillEdit } from "react-icons/ai";
import { BiSearch } from "react-icons/bi";
import { RxCross2 } from "react-icons/rx";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import apiService, {
  getEventParticipants,
  giveEventCertificate,
} from "../../../../../../../../../../api";
import { useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import Certificate from "../../../../../../../../../assets/certificate.png";
import html2canvas from "html2canvas";

import { useState } from "react";
import toast from "react-hot-toast";

const Cirtificate = ({ setActive }) => {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [participantId, setParticipantId] = useState(null);
  const [participantName, setParticipantName] = useState(null);
  const eventName = localStorage.getItem("eventName");

  const certificateRef = useRef(null);

  const [data, setData] = useState([]);
  const getParticipants = async () => {
    try {
      const res = await getEventParticipants(id);
      setData(res.data.data);
    } catch (error) {
      // console.log(error);
    }
  };

  const handleToggleModal = () => {
    setShowModal(!showModal);
  };

  const handleGiveCertificate = async () => {
    try {
      const canvas = await html2canvas(certificateRef.current);
      const dataUrl = canvas.toDataURL();

      const res = await giveEventCertificate({
        participantId: participantId,
        certificate: dataUrl,
      });
      toast.success("Certificate given successfully");
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    getParticipants();
  }, []);

  return (
    <>
      <div className="lg:pr-6 lg:ml-[300px]">
        <div
          className="bg-white mt-10 py-8 px-6 rounded-lg"
          style={{
            boxShadow: "0px 4px 4px 0px #00000040",
          }}
        >
          <div className="flex justify-between gap-3 items-center">
            <div>
              <p className="text-[16px] font-medium text-primary">
                Event Certificate
              </p>
              <p className="font-medium text-gray-400 block lg:hidden">
                All (125)
              </p>
            </div>
            <div className="md:flex justify-between items-center gap-6">
              <div className="flex items-center px-2 py-1 border border-gray-300 bg-[#F6F8FA] rounded">
                <BiSearch className="text-[#343A40]" size={20} />
                <input
                  className="outline-none bg-[#F6F8FA] md:w-[300px]"
                  type="search"
                  name=""
                  id=""
                  placeholder="Search.."
                />
              </div>
              <div className="mt-3 md:mt-0">
                <button
                  className="text-white text-xs md:text-base bg-primary px px-4 py-1 rounded-md"
                  onClick={() => setActive("create-cirtificate")}
                >
                  Add Certificate
                </button>
              </div>
            </div>
          </div>

          {/* Header End */}
          {/* Table Start */}
          <div className="mt-5 mx-2 md:mx-0">
            <div className="overflow-x-auto">
              <table className="w-[100%] mt-8 text-xs md:text-base">
                <thead>
                  <tr className="text-primary">
                    <th className="py-4 px-4">No</th>
                    <th className="py-4 px-4">Name</th>
                    <th className="py-4 px-4">Round</th>
                    <th className="py-4 px-4">Image</th>
                    <th className="py-4 px-4">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-300 text-gray-500"
                    >
                      <td className="text-center py-4 px-4">{index + 1}</td>
                      <td className="text-center py-4 px-4">{item.name}</td>
                      <td className="text-center py-4 px-4">{item.round}</td>
                      <td className="text-center py-4 px-4">
                        <img
                          className="w-[20px] h-[20px] md:w-[30px] md:h-[30px] rounded-full mx-auto"
                          src={
                            item.profileImg ||
                            "https://gidbucket.s3.ap-south-1.amazonaws.com/9131529.png"
                          }
                          alt=""
                        />
                      </td>
                      <td className="flex justify-center py-4">
                        <AiFillEdit
                          onClick={() => {
                            setParticipantId(item?._id);
                            setParticipantName(item.name);
                            handleToggleModal();
                          }}
                          className="cursor-pointer"
                          size={30}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Table End */}
        </div>
      </div>

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full backdrop-blur-sm z-50">
          <div className=" bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg p-4 border-4 border-gray-700  flex flex-col gap-4">
            <div className=" relative" ref={certificateRef}>
              <img className="w-full" src={Certificate} alt="" />
              <h3 className="absolute top-[51%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-semibold text-black font">
                {participantName}
              </h3>
              <p className="absolute top-[60.5%] left-[60%] transform -translate-x-1/2 -translate-y-1/2 text-xs text-black">
                {participantName}
              </p>
              <p className="absolute top-[64%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-black">
                {eventName}
              </p>
            </div>
            <div
              className="cursor-pointer  border rounded-full max-w-fit float-right absolute top-2 right-2 bg-white"
              onClick={handleToggleModal}
            >
              <RxCross2 size={25} />
            </div>
            <div>
              <button
                onClick={handleGiveCertificate}
                className="bg-primary px-3 py-1 rounded-xl text-white"
              >
                Give Certificate
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white mt-8 lg:ml-[255px] pt-3">
        <div className="flex justify-between items-center">
          <div className="mt-2 lg:ml-2">
            <p>Showing 1 to 10 of 50 entries</p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="bg-[#DFDFDF] p-2">
              <IoIosArrowBack />
            </div>
            <p className="text-gray-500">1</p>
            <p className="text-gray-500">2</p>
            <p className="text-gray-500">3</p>
            <p className="text-gray-500">4</p>
            <div className="bg-[#DFDFDF] p-2">
              <IoIosArrowForward />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cirtificate;
