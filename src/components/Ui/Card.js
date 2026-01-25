export default function Card({ children, className = '', title = null }) {
  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {title && (
        <div className="bg-[#1b428e] px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
