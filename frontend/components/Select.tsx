import {
  CheckmarkRegular,
  ChevronUpRegular,
  ChevronDownRegular,
} from "@fluentui/react-icons";
import * as RadixSelect from "@radix-ui/react-select";
import clsx from "clsx";

export type SelectItem = {
  type: "item";
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectGroup = {
  type: "group";
  label: string;
  items: SelectItems;
};

export type SelectSeparator = {
  type: "separator";
};

export type SelectItems = (SelectItem | SelectGroup | SelectSeparator)[];

const SelectItemComponent: React.FC<{ item: SelectItem }> = ({ item }) => (
  <RadixSelect.Item
    className="relative pl-6 duration-200 transition-colors hover:text-themeText outline-none cursor-pointer"
    value={item.value}
    disabled={item.disabled}
  >
    <RadixSelect.ItemIndicator className="absolute left-0 top-1/2 transform -translate-y-1/2">
      <CheckmarkRegular />
    </RadixSelect.ItemIndicator>
    <RadixSelect.ItemText>{item.label}</RadixSelect.ItemText>
  </RadixSelect.Item>
);

const SelectGroupComponent: React.FC<{ group: SelectGroup }> = ({ group }) => (
  <RadixSelect.Group>
    <RadixSelect.Label>{group.label}</RadixSelect.Label>
    <SelectItemsComponent items={group.items} />
  </RadixSelect.Group>
);

const SelectItemsComponent: React.FC<{ items: SelectItems }> = ({ items }) =>
  items.map((item, i) => {
    switch (item.type) {
      case "item":
        return <SelectItemComponent key={i} item={item} />;
      case "group":
        return <SelectGroupComponent key={i} group={item} />;
      case "separator":
        return <RadixSelect.Separator key={i} />;
    }
  });

const Select: React.FC<{
  items: SelectItems;
  value: string;
  defaultValue?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}> = (props) => (
  <RadixSelect.Root
    defaultValue={props.defaultValue}
    disabled={props.disabled}
    onValueChange={props.onChange}
  >
    <RadixSelect.Trigger
      className={clsx("text-input relative cursor-pointer", props.disabled && "disabled")}
    >
      <RadixSelect.Value>{props.children}</RadixSelect.Value>
      <RadixSelect.Icon>
        <ChevronDownRegular />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>

    <RadixSelect.Portal>
      <RadixSelect.Content className="p-2 flex flex-row bg-input drop-shadow-lg rounded">
        <RadixSelect.ScrollUpButton>
          <ChevronUpRegular />
        </RadixSelect.ScrollUpButton>
        <RadixSelect.Viewport>
          <SelectItemsComponent items={props.items} />
        </RadixSelect.Viewport>
        <RadixSelect.ScrollDownButton>
          <ChevronDownRegular />
        </RadixSelect.ScrollDownButton>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  </RadixSelect.Root>
);

export default Select;
