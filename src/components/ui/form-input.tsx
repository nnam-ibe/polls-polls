import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

type FormInputProps = {
  control: Control<any, any>;
  name: string;
  label: string;
  placeholder: string;
  helpText?: string;
  isRequired?: boolean;
  rightAddOn?: React.ReactNode;
};

export function FormInput(props: FormInputProps) {
  const {
    name,
    label,
    helpText,
    placeholder,
    control,
    isRequired = false,
    rightAddOn,
  } = props;
  const labelClass = isRequired ? "required-field" : "";
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={labelClass}>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              {...field}
              rightAddOn={rightAddOn}
            />
          </FormControl>
          <FormDescription>{helpText}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
