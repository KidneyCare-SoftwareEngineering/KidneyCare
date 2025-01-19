const SearchBox: React.FC<> = () => {
    return(
        <>
            <div className="flex justify-center items-start flex-col w-full pl-5">
                <input 
                type="search" 
                id="search" 
                className="block border border-grey300 rounded-xl w-3/5 max-h-14 p-4 text-lg text-gray-900 " placeholder="ค้นหาอาหาร" required />
            </div>
            
        </>
    )
}
export default SearchBox