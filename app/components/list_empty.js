const Listempty = ({ title, description }) => {
  return (
    <tr>
      <td colSpan="6">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            {/* simple icon (list) */}
            <svg
              className="h-8 w-8"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
              />
            </svg>
          </div>
          <div className="mt-4 text-lg font-medium text-gray-900">{title}</div>
          <div className="mt-2 text-sm text-gray-500">{description}</div>
        </div>
      </td>
    </tr>
  );
};

export default Listempty;
