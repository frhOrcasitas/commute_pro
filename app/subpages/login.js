
function login() {

    return (
        <section className="min-h-screen flex items-center justify-center font-mono bg-gray-100">
            

            <div className="flex shadow-2xl">
                <div className="flex flex-col items-center justify-center text0center p-20 gap-8  bg-white rounded-2xl">
                    <h1 className="text-3xl font-bold">Login</h1>
                    <input type="text" placeholder="Username" className="border-2 border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="password" placeholder="Password" className="border-2 border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300">Login</button>
                </div>
            </div>
        </section>
    )
}