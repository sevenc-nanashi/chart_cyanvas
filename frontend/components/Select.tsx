import {
  CheckmarkRegular,
  ChevronDownRegular,
  ChevronUpRegular,
} from "@fluentui/react-icons";
import * as RadixSelect from "@radix-ui/react-select";
import clsx from "clsx";

export type SelectItem<T extends string> = {
  type: "item";
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type SelectGroup<T extends string> = {
  type: "group";
  label: string;
  items: SelectItems<T>;
};

export type SelectSeparator = {
  type: "separator";
};

export type SelectItems<T extends string> = (
  | SelectItem<T>
  | SelectGroup<T>
  | SelectSeparator
)[];

const SelectItemComponent: React.FC<{
  item: SelectItem<string>;
  selected: boolean;
}> = ({ item, selected }) => (
  <RadixSelect.Item
    className={clsx(
      "relative pl-6 pr-2 py-1 duration-200 transition-colors hover:text-theme-text outline-none cursor-pointer rounded",
      selected && "bg-theme/25",
    )}
    value={item.value}
    disabled={item.disabled}
  >
    <RadixSelect.ItemIndicator className="absolute left-[0.25rem] top-[calc(50%_-_0.125rem)] transform -translate-y-1/2">
      <CheckmarkRegular />
    </RadixSelect.ItemIndicator>
    <RadixSelect.ItemText>{item.label}</RadixSelect.ItemText>
    {item.description && (
      <p className="text-xs text-gray-500">{item.description}</p>
    )}
  </RadixSelect.Item>
);

const SelectGroupComponent = <T extends string>({
  group,
  selected,
}: React.PropsWithoutRef<{
  group: SelectGroup<T>;
  selected: T;
}>) => (
  <RadixSelect.Group>
    <RadixSelect.Label>{group.label}</RadixSelect.Label>
    <SelectItemsComponent items={group.items} selected={selected} />
  </RadixSelect.Group>
);

const SelectItemsComponent: React.FC<{
  items: SelectItems<string>;
  selected: string;
}> = ({ items, selected }) =>
  items.map((item, i) => {
    switch (item.type) {
      case "item":
        return (
          <SelectItemComponent
            key={i}
            item={item}
            selected={item.value === selected}
          />
        );
      case "group":
        return (
          <SelectGroupComponent key={i} group={item} selected={selected} />
        );
      case "separator":
        return <RadixSelect.Separator key={i} />;
    }
  });

const Select = <T extends string>(
  props: React.PropsWithoutRef<{
    items: SelectItems<T>;
    value: string;
    defaultValue?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    children?: React.ReactNode;
    className?: string;
  }>,
) => (
  <RadixSelect.Root
    defaultValue={props.defaultValue}
    disabled={props.disabled}
    value={props.value}
    onValueChange={props.onChange}
  >
    <RadixSelect.Trigger
      className={clsx(
        "text-input relative cursor-pointer flex justify-between items-center",
        props.disabled && "disabled",
        props.className,
      )}
    >
      <RadixSelect.Value>{props.children}</RadixSelect.Value>
      <RadixSelect.Icon className="ml-1">
        <ChevronDownRegular />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>

    <RadixSelect.Portal>
      <RadixSelect.Content
        className="p-2 flex flex-row bg-input drop-shadow-lg rounded z-[9999]"
        position="popper"
      >
        <RadixSelect.ScrollUpButton>
          <ChevronUpRegular />
        </RadixSelect.ScrollUpButton>
        <RadixSelect.Viewport>
          <SelectItemsComponent items={props.items} selected={props.value} />
        </RadixSelect.Viewport>
        <RadixSelect.ScrollDownButton>
          <ChevronDownRegular />
        </RadixSelect.ScrollDownButton>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  </RadixSelect.Root>
);

export default Select;
