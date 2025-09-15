export function Logo() {
    return (
      <div className="flex items-center gap-2 font-semibold text-primary">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM12 21.6C17.3019 21.6 21.6 17.3019 21.6 12C21.6 6.69807 17.3019 2.4 12 2.4C6.69807 2.4 2.4 6.69807 2.4 12C2.4 17.3019 6.69807 21.6 12 21.6ZM9.31139 18.9168L12.0001 7.2H14.6888L17.2127 18.9168H14.596L13.9009 16.32H10.1238L9.4286 18.9168H9.31139ZM12.0125 9.408L10.7062 14.4H13.3188L12.0125 9.408Z"
            />
        </svg>
        <span className="hidden md:inline-block">AndonPro</span>
      </div>
    );
  }
  