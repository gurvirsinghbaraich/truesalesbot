import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen h-screen overflow-hidden grid grid-rows-[80px_1fr]">
      <div className="grid grid-cols-[240px_1fr] border-b-2 border-gray-700">
        <div className="border-r-2 flex gap-2 items-center border-gray-700 justify-center font-bold text-xl bg-[#001d3d]">
          <Image src={"/icon.svg"} alt="logo" width={24} height={24} />
        </div>
        <div className="bg-[#001d3d]">Topbar</div>
      </div>
      <div className="grid grid-cols-[240px_1fr]">
        <div className="border-r p-4 flex flex-col gap-4 justify-between bg-[#001d3d] text-white">
          <ul className="flex flex-col gap-2">
            <li className="flex items-center gap-2 cursor-pointer bg-[#003566] p-4 rounded-md">
              <Image
                src={"/assistant.svg"}
                alt="assistant"
                width={24}
                height={24}
              />
              <span>Assistants</span>
            </li>
          </ul>

          <button className="flex items-center justify-between cursor-pointer border-t w-full p-4">
            <span>Logout</span>
            <Image src={"/logout.svg"} alt="logout" width={24} height={24} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
