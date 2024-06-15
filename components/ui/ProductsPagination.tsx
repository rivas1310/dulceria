import Link from "next/link";

type ProductsPaginationProps = {
    page : number
    totalPages: number
}


export default function ProductsPagination({page ,totalPages} : ProductsPaginationProps) {

  const pages = Array.from({length: totalPages}, (_, i) => i+ 1)
  return (
    <nav className="flex justify-center text-4xl  text-black py-10">
      {page > 1 && (
        <Link
          href={`/admin/products?page=${page - 1}`}
          className="bg-customBlue px-4 py-2 text-4xl text-gray-900 ring-1 ring-insite ring-gray-300 focus:z-20 focus:outline-offset-9"
        >
          &laquo;
        </Link>
      )}

      {pages.map((currentPage) => (
        <Link
          key={currentPage}
          href={`/admin/products?page=${currentPage}`}
          className={`${page === currentPage ? 'font-black bg-customBlue' : 'bg-white'} px-3 py-2 text-xl text-gray-900 ring-1 ring-insite ring-gray-300 focus:z-20 focus:outline-offset-`}
        >
          {currentPage}
        </Link>
      ))}

      {page < totalPages && (
        <Link
          href={`/admin/products?page=${page + 1}`}
          className="bg-customBlue px-4 py-2 text-4xl text-gray-900 ring-1 ring-insite ring-gray-300 focus:z-20 focus:outline-offset-0"
        >
          &raquo;
        </Link>
      )}
    </nav>
  );
}
