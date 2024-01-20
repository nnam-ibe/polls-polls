import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = {
  value: string;
  label: string;
};

type FormSelectProps = {
  control: Control<any, any>;
  name: string;
  label: string;
  placeholder: string;
  helpText?: string;
  isRequired?: boolean;
  options: Option[];
  selectedValues?: string[];
};

export function FormSelect(props: FormSelectProps) {
  const {
    name,
    label,
    helpText,
    placeholder,
    control,
    isRequired = false,
    options,
    selectedValues = [],
  } = props;
  const labelClass = isRequired ? "required-field" : "";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={labelClass}>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value={""}>--</SelectItem>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={
                    field.value !== option.value &&
                    selectedValues.includes(option.value)
                  }
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>{helpText}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
