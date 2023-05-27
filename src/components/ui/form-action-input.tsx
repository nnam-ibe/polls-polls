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
import { Button } from "@/components/ui/button";

type FormActionInputProps = {
  control: Control<any, any>;
  name: string;
  inputName: string;
  label: string;
  placeholder: string;
  helpText?: string;
  onActionClick?: () => void;
};

export function FormActionInput(props: FormActionInputProps) {
  const {
    name,
    inputName,
    label,
    helpText,
    placeholder,
    control,
    onActionClick,
  } = props;

  return (
    <FormField
      control={control}
      name={inputName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              {...field}
              className="rounded-r-none"
              rightAddOn={
                <Button
                  className="rounded-l-none"
                  type="button"
                  onClick={onActionClick}
                >
                  Add Choice
                </Button>
              }
            />
          </FormControl>
          <FormDescription>{helpText}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
