interface AppHeaderProps {
  userName: string;
}

const AppHeader = ({ userName }: AppHeaderProps) => {
  return (
    <header className="bg-red-600 text-white p-4 flex justify-end items-center">
      <div className="flex items-center">
        <span>Welcome, {userName}</span>
        <button className="ml-4 bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded">
          Logout
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
