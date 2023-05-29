import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupCard,
} from "@/components/ui/radio-group";

type Option = {
  value: string;
  label: string;
};

type FormRadioGroupProps = {
  control: Control<any, any>;
  name: string;
  label: string;
  options: Option[];
  isRequired?: boolean;
};

export function FormRadioGroup(props: FormRadioGroupProps) {
  const { name, label, options, control, isRequired = false } = props;
  const labelClass = isRequired ? "required-field" : "";
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className={labelClass}>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              {options.map((option) => (
                <FormItem
                  className="flex items-center space-x-3 space-y-0"
                  key={option.value}
                >
                  <FormControl>
                    <RadioGroupItem value={option.value} />
                  </FormControl>
                  <FormLabel className="font-normal">{option.label}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

type StyledFormRadioGroupProps = FormRadioGroupProps & {
  value: string;
};

export function StyledFormRadioGroup(props: StyledFormRadioGroupProps) {
  const { name, label, options, control, isRequired = false, value } = props;

  const labelClass = isRequired ? "required-field" : "";
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className={labelClass}>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-0.5"
            >
              {options.map((option) => {
                const labelClass =
                  option.value === value
                    ? "bg-accent text-accent-foreground"
                    : "";
                return (
                  <FormItem
                    className="flex items-center space-x-3 space-y-0"
                    key={option.value}
                  >
                    <FormLabel
                      className={`font-normal text-base border-2 rounded-md shadow-md w-full px-2 py-3 cursor-pointer ${labelClass}`}
                    >
                      {option.label}
                      <FormControl>
                        <RadioGroupCard value={option.value} />
                      </FormControl>
                    </FormLabel>
                  </FormItem>
                );
              })}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
