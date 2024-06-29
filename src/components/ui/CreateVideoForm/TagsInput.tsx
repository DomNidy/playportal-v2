import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { type ControllerRenderProps } from "react-hook-form";
import { Input } from "../Input";

interface TagsInputProps {
  initialKeywords?: string[];
  onKeywordsChange: (keywords: string[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controllerRenderProps?: ControllerRenderProps<any>;
}

const TagsInput: React.FC<TagsInputProps> = ({
  initialKeywords = [],
  onKeywordsChange,
  controllerRenderProps,
}) => {
  // When the passed keywords are changed, overwrite the interal state with them
  useEffect(() => {
    setKeywords(initialKeywords);
  }, [initialKeywords]);

  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [inputValue, setInputValue] = useState<string>("");

  // Handles adding new keyword on Enter or comma press, and keyword removal on Backspace
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      (event.key === "Enter" || event.key === ",") &&
      inputValue.trim() !== ""
    ) {
      event.preventDefault();
      const newKeywords = [...keywords, inputValue.trim()];
      setKeywords(newKeywords);
      onKeywordsChange(newKeywords);
      setInputValue("");
    } else if (event.key === "Backspace" && inputValue === "") {
      event.preventDefault();
      const newKeywords = keywords.slice(0, -1);
      setKeywords(newKeywords);
      onKeywordsChange(newKeywords);
    }
  };

  // Handles pasting keywords separated by commas, new lines, or tabs
  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const paste = event.clipboardData.getData("text");
    const keywordsToAdd = paste
      .split(/[\n\t,]+/)
      .map((keyword) => keyword.trim())
      .filter(Boolean);
    if (keywordsToAdd.length) {
      const newKeywords = [...keywords, ...keywordsToAdd];
      setKeywords(newKeywords);
      onKeywordsChange(newKeywords);
      setInputValue("");
    }
  };

  // Updates the inputValue state as the user types
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Adds the keyword when the input loses focus, if there's a keyword to add
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (inputValue.trim() !== "" && event.relatedTarget?.tagName !== "BUTTON") {
      const newKeywords = [...keywords, inputValue.trim()];
      setKeywords(newKeywords);
      onKeywordsChange(newKeywords);
      setInputValue("");
    }

    controllerRenderProps?.onBlur();
  };

  // Removes a keyword from the list
  const removeKeyword = (indexToRemove: number) => {
    const newKeywords = keywords.filter((_, index) => index !== indexToRemove);
    setKeywords(newKeywords);
    onKeywordsChange(newKeywords);
  };

  return (
    <div
      className="flex w-full flex-wrap items-center rounded-lg border p-2"
      ref={controllerRenderProps?.ref}
    >
      <div
        className="flex w-full flex-wrap overflow-y-auto"
        style={{ maxHeight: "300px" }}
      >
        {keywords.map((keyword, index) => (
          <button
            key={index}
            type="button"
            onClick={() => removeKeyword(index)}
            className="m-1 flex items-center rounded-full bg-blue-500 px-2 py-1 text-xs text-white"
          >
            {keyword}
            <X size={14} className="ml-2 cursor-pointer" />
          </button>
        ))}
        <Input
          type="text"
          name={controllerRenderProps?.name}
          disabled={controllerRenderProps?.disabled}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={(e) => handleBlur(e)}
          autoComplete="off"
          className="my-1 flex-1 border-0  text-sm focus-visible:border-0 focus-visible:outline-0 focus-visible:ring-0"
          placeholder="Type keyword and press Enter..."
        />
      </div>
    </div>
  );
};

export default TagsInput;
