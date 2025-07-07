'use client';

import React, { useState, KeyboardEvent } from 'react';
import { Input } from './Input';
import { Tag } from './Tag';
import { Button } from './Button'; // Assuming Button component exists

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  className?: string;
}

export function TagInput({
  tags,
  onChange,
  placeholder = 'Adicionar tag...',
  suggestions = [],
  className = '',
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value && suggestions.length > 0) {
      setFilteredSuggestions(
        suggestions.filter(
          (suggestion) =>
            suggestion.toLowerCase().includes(value.toLowerCase()) &&
            !tags.includes(suggestion) // Don't suggest already added tags
        )
      );
    } else {
      setFilteredSuggestions([]);
    }
  };

  const addTag = (tagToAdd: string) => {
    const trimmedTag = tagToAdd.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
    setInputValue('');
    setFilteredSuggestions([]);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault(); // Prevent form submission or comma input
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag on backspace if input is empty
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Tag key={tag} className="flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
              aria-label={`Remover tag ${tag}`}
            >
              &times; {/* Multiplication sign as 'x' */}
            </button>
          </Tag>
        ))}
      </div>
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full"
        />
        {filteredSuggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
            {filteredSuggestions.map((suggestion) => (
              <li
                key={suggestion}
                onClick={() => addTag(suggestion)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
       {/* Optional: Display all suggestions if input is focused but empty */}
       {/* {inputValue === '' && suggestions.length > 0 && ( ... )} */}
    </div>
  );
}
