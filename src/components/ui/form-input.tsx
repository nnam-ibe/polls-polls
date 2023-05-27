import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type FormInputProps = {
  control: Control<any, any>;
  name: string;
  label: string;
  placeholder: string;
  helpText?: string;
};

export function FormInput(props: FormInputProps) {
  const { name, label, helpText, placeholder, control } = props;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} />
          </FormControl>
          <FormDescription>{helpText}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
