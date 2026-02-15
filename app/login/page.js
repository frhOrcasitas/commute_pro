import Image from "next/image";
import Link from "next/link";

function login() {

    return (
    <>
        <nav className="flex items-center justify-between px-4 py-3 transition-colors duration-300 bg-[#576A8F]">
            <Link href="/" className="flex items-center gap-2 text-white">
                <span className="text-xl font-bold">CommutePro</span>
            </Link>
        </nav>

        <section className="min-h-screen flex items-center justify-center font-mono bg-gray-100">
            <div className="flex shadow-2xl bg-white rounded-2xl overflow-hidden">
                <div className="flex flex-col items-center justify-center text-center p-12 gap-12 w-[650px]">
                    <h1 className="text-3xl font-bold text-black">Login</h1>

                    <div className="w-full flex flex-col gap-8">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-lg font-bold text-gray-700 col-span-1">Email</label>
                            <input type="text" placeholder="ex. user123@youremail.com" className="col-span-3 border-2 text-gray-500 border-2 border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                    
                    <div className="w-full flex flex-col gap-8">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-lg font-bold text-gray-700 col-span-1">Password</label>
                            <input type="password" placeholder="must be at least 10 characters" className="col-span-3 border-2 text-gray-500 border-2 border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />                        </div>
                    </div>
                    
                    <div className="w-full flex flex-row gap-20 justify-center">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300">Register</button>
                        <Link href="/dashboard" className="text-white hover:text-gray-300 transition duration-300">
                             <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300">Login</button>
                        </Link>
                    </div>
                    
                </div>
            </div>
        </section>
    </>
    )
}

export default login;