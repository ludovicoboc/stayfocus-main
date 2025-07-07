import React from 'react';
import { Input } from './Input'; // Assuming Input component exists in the same directory

interface PesquisaProps {
  placeholder?: string;
  valor: string;
  aoMudar: (valor: string) => void;
  className?: string;
}

export function Pesquisa({
  placeholder = 'Pesquisar...',
  valor,
  aoMudar,
  className = '',
}: PesquisaProps) {
  return (
    <div className={`relative ${className}`}>
      <Input
        type="search"
        placeholder={placeholder}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        className="pl-10 pr-4 py-2 w-full" // Add padding for icon if needed
      />
      {/* Optional: Add a search icon */}
      {/* <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span> */}
    </div>
  );
}
