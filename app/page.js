import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
        <nav className="flex items-center justify-between px-4 py-3 transition-colors duration-300 bg-[#576A8F]">
            <Link href="/" className="flex items-center gap-2 text-white">
                <span className="text-xl font-bold">CommutePro</span>
            </Link>

            <div className="flex items-center gap-4">
                <Link href="/login" className="text-white hover:text-gray-300 transition duration-300">How it Works</Link>
                <button className="px-3 py-1 rounded-md transition bg-[#FFF8DE] hover:bg-[#FFF8DE]/90 text-[#576A8F] font-semibold">Login / Signup</button>
            </div>
        </nav>

        <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
            <h1 className="text-6xl font-bold text-[#576A8F]">CommutePro</h1>
            <p className="text-lg text-gray-600 max-w-md">The Commuter's Best Friend</p>
        </div>

        <main className="py-12 bg-gray-100 flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
            <div className="max-w-6xl mx-auto px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
                    <div>
                        <h2 className="text-3xl font-semibold mb-6 text-[#576A8F] text-center">Traffic: A Commuter's Nightmare</h2>

                        <div className="bg-gray-300 h-64 flex items-center justify-center rounded-lg shadow mb-6">
                            oui
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-semibold mb-6 text-[#576A8F] text-center">How it Works</h2>
                        
                        <div className="bg-gray-300 h-64 flex items-center justify-center rounded-lg shadow mb-6">
                            <ol className="text-gray-600 max-w-lg text-left list-disc list-inside">
                                <li>Real-time traffic updates</li>
                                <li>Personalized route suggestions</li>
                                <li>User-friendly interface</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
            
        </main>

        <main className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
            <h1 className="text-6xl font-bold text-[#576A8F]">Ready to become a commuter pro?</h1>
            <p className="text-lg text-gray-600 max-w-md">Register here now! Or if you have already owned an account, login here!</p>
            <div className="flex items-center gap-4">

                <Link href="/login" className="text-white hover:text-gray-300 transition duration-300">
                    <button className="px-6 py-3 rounded-md transition bg-[#FFF8DE] hover:bg-[#FFF8DE]/90 text-[#576A8F] font-semibold mr-4">Register</button>
                </Link>

                <Link href="/login" className="text-white hover:text-gray-300 transition duration-300">
                    <button className="px-6 py-3 rounded-md transition bg-[#FFF8DE] hover:bg-[#FFF8DE]/90 text-[#576A8F] font-semibold">Login</button>
                </Link>
            </div>
        </main>
    </>
        
  );
}
