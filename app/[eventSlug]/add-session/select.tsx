import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

type Option = {
  value: string;
  available: boolean;
  helperText?: string;
};
export function MyListbox(props: {
  options: Option[];
  currValue?: string;
  setCurrValue: (value: string) => void;
  placeholder: string;
}) {
  const { options, currValue, setCurrValue, placeholder } = props;
  const currOption = options.find((option) => option.value === currValue);
  return (
    <Listbox value={currValue} onChange={setCurrValue}>
      <div className="relative mt-1">
        <Listbox.Button className="h-12 rounded-md border px-4 shadow-sm transition-colors invalid:border-red-500 invalid:text-red-900 focus:outline-none relative w-full cursor-pointer border-black focus:ring-2 focus:ring-black focus:outline-0 focus:border-none bg-white py-2 pl-3 pr-10 text-left">
          {currValue ? (
            <span className="text-black truncate flex items-center justify-between">
              {currValue}
              {currOption?.helperText && (
                <span className="inline text-xs text-black truncate">
                  {currOption.helperText}
                </span>
              )}
            </span>
          ) : (
            <span className="block truncate text-black">{placeholder}</span>
          )}
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-black" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-72 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
            {options.map((option) => {
              return (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active }) =>
                    clsx(
                      "relative cursor-pointer select-none py-2 pl-10 pr-4 z-10 disabled:text-gray-400 disabled:cursor-default",
                      active
                        ? "bg-black text-white"
                        : "text-black bg-white"
                    )
                  }
                  disabled={!option.available}
                >
                  {({ selected, disabled }) => (
                    <>
                      <span
                        className={clsx(
                          "flex items-end justify-between truncate",
                          selected ? "font-medium" : "font-normal",
                          disabled ? "text-gray-400" : "text-black"
                        )}
                      >
                        {option.value}
                        {option.helperText && (
                          <span className="inline text-xs text-black truncate">
                            {option.helperText}
                          </span>
                        )}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black">
                          <CheckIcon className="h-5 w-5" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              );
            })}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
