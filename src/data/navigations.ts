import type { NavigationType } from "@/types"

const allNavigationsData: NavigationType[] = [
  {
    title: "Dashboards",
    items: [
      {
        title: "Analytics",
        href: "/dashboards/analytics",
        iconName: "ChartPie",
      },
      {
        title: "Organizations",
        href: "/organizations",
        iconName: "Building2",
      },
    ],
  },
  {
    title: "Apps",
    items: [
      {
        title: "Email",
        href: "/apps/email",
        iconName: "AtSign",
      },
      {
        title: "Chat",
        href: "/apps/chat",
        iconName: "MessageCircle",
      },
      {
        title: "Calendar",
        href: "/apps/calendar",
        iconName: "Calendar",
      },
      {
        title: "Kanban",
        href: "/apps/kanban",
        iconName: "Grid2x2",
      },
      {
        title: "Todo",
        href: "#",
        label: "Soon",
        iconName: "ListTodo",
      },
    ],
  },
  // public pages {store}
  {
    title: "Public",
    items: [
      {
        title: "Store",
        href: "/public/store",
        iconName: "ShoppingCart",
      },
    ],
  },
  {
    title: "Design System",
    devOnly: true,
    items: [
      {
        title: "Colors",
        iconName: "SwatchBook",
        href: "/colors",
      },
      {
        title: "Typography",
        iconName: "Type",
        href: "/typography",
      },
      {
        title: "UI",
        iconName: "LayoutGrid",
        items: [
          {
            title: "Accordion",
            href: "/ui/accordion",
          },
          {
            title: "Alert",
            href: "/ui/alert",
          },
          {
            title: "Alert Dialog",
            href: "/ui/alert-dialog",
          },
          {
            title: "Aspect Ratio",
            href: "/ui/aspect-ratio",
          },
          {
            title: "Avatar",
            href: "/ui/avatar",
          },
          {
            title: "Badge",
            href: "/ui/badge",
          },
          {
            title: "Breadcrumb",
            href: "/ui/breadcrumb",
          },
          {
            title: "Button",
            href: "/ui/button",
          },
          {
            title: "Calendar",
            href: "/ui/calendar",
          },
          {
            title: "Card",
            href: "/ui/card",
          },
          {
            title: "Carousel",
            href: "/ui/carousel",
          },
          {
            title: "Checkbox",
            href: "/ui/checkbox",
          },
          {
            title: "Collapsible",
            href: "/ui/collapsible",
          },
          {
            title: "Combobox",
            href: "/ui/combobox",
          },
          {
            title: "Command",
            href: "/ui/command",
          },
          {
            title: "Context Menu",
            href: "/ui/context-menu",
          },
          {
            title: "Dialog",
            href: "/ui/dialog",
          },
          {
            title: "Drawer",
            href: "/ui/drawer",
          },
          {
            title: "Dropdown Menu",
            href: "/ui/dropdown-menu",
          },
          {
            title: "Form",
            href: "/ui/form",
          },
          {
            title: "Hover Card",
            href: "/ui/hover-card",
          },
          {
            title: "Input",
            href: "/ui/input",
          },
          {
            title: "Input OTP",
            href: "/ui/input-otp",
          },
          {
            title: "Label",
            href: "/ui/label",
          },
          {
            title: "Menubar",
            href: "/ui/menubar",
          },
          {
            title: "Navigation Menu",
            href: "/ui/navigation-menu",
          },
          {
            title: "Pagination",
            href: "/ui/pagination",
          },
          {
            title: "Popover",
            href: "/ui/popover",
          },
          {
            title: "Progress",
            href: "/ui/progress",
          },
          {
            title: "Radio Group",
            href: "/ui/radio-group",
          },
          {
            title: "Resizable",
            href: "/ui/resizable",
          },
          {
            title: "Scroll Area",
            href: "/ui/scroll-area",
          },
          {
            title: "Select",
            href: "/ui/select",
          },
          {
            title: "Separator",
            href: "/ui/separator",
          },
          {
            title: "Sheet",
            href: "/ui/sheet",
          },
          {
            title: "Skeleton",
            href: "/ui/skeleton",
          },
          {
            title: "Slider",
            href: "/ui/slider",
          },
          {
            title: "Sonner",
            href: "/ui/sonner",
          },
          {
            title: "Switch",
            href: "/ui/switch",
          },
          {
            title: "Table",
            href: "/ui/table",
          },
          {
            title: "Tabs",
            href: "/ui/tabs",
          },
          {
            title: "Textarea",
            href: "/ui/textarea",
          },
          {
            title: "Toast",
            href: "/ui/toast",
          },
          {
            title: "Toggle",
            href: "/ui/toggle",
          },
          {
            title: "Toggle Group",
            href: "/ui/toggle-group",
          },
          {
            title: "Tooltip",
            href: "/ui/tooltip",
          },
        ],
      },
      {
        title: "Extended UI",
        iconName: "LayoutDashboard",
        items: [
          {
            title: "Avatar Stack",
            href: "/extended-ui/avatar-stack",
          },
          {
            title: "Media Grid",
            href: "/extended-ui/media-grid",
          },
          {
            title: "Editor",
            href: "/extended-ui/editor",
          },
          {
            title: "File Dropzone",
            href: "/extended-ui/file-dropzone",
          },
          {
            title: "Input File",
            href: "/extended-ui/input-file",
          },
          {
            title: "Input Group",
            href: "/extended-ui/input-group",
          },
          {
            title: "Input Phone",
            href: "/extended-ui/input-phone",
          },
          {
            title: "Input Spin",
            href: "/extended-ui/input-spin",
          },
          {
            title: "Input Tags",
            href: "/extended-ui/input-tags",
          },
          { title: "Emoji Picker", href: "/extended-ui/emoji-picker" },
          {
            title: "Keyboard",
            href: "/extended-ui/keyboard",
          },
          {
            title: "Rating",
            href: "/extended-ui/rating",
          },
          {
            title: "Separator with Text",
            href: "/extended-ui/separator-with-text",
          },
          {
            title: "Show More Text",
            href: "/extended-ui/show-more-text",
          },
          {
            title: "Timeline",
            href: "/extended-ui/timeline",
          },
          {
            title: "Sticky Layout",
            href: "/extended-ui/sticky-layout",
          },
          {
            title: "Bento Grid",
            href: "/extended-ui/bento-grid",
          },
          {
            title: "Mockups",
            href: "/extended-ui/mockups",
          },
          {
            title: "Steps",
            href: "/extended-ui/steps",
          },
          {
            title: "Sortable List",
            href: "/extended-ui/sortable-list",
          },
        ],
      },
      {
        title: "Forms",
        iconName: "TextCursorInput",
        items: [
          {
            title: "Basic Inputs",
            href: "/forms/basic-inputs",
          },
          {
            title: "File Dropzones",
            href: "/forms/file-dropzones",
          },
          {
            title: "Form Layouts",
            href: "/forms/form-layouts",
          },
          {
            title: "Pickers",
            href: "/forms/pickers",
          },
          {
            title: "Select and Tags",
            href: "/forms/select-and-tags",
          },
        ],
      },
      {
        title: "Tables",
        href: "/tables",
        iconName: "Table",
      },
      {
        title: "Charts",
        iconName: "ChartArea",
        items: [
          {
            title: "Area Charts",
            href: "/charts/area-charts",
          },
          {
            title: "Bar Charts",
            href: "/charts/bar-charts",
          },
          {
            title: "Composed Charts",
            href: "/charts/composed-charts",
          },
          {
            title: "Line Charts",
            href: "/charts/line-charts",
          },
          {
            title: "Pie Charts",
            href: "/charts/pie-charts",
          },
          {
            title: "Radar Charts",
            href: "/charts/radar-charts",
          },
          {
            title: "Radial Bar Charts",
            href: "/charts/radial-bar-charts",
          },
          {
            title: "Scatter Charts",
            href: "/charts/scatter-charts",
          },
          {
            title: "Treemap Charts",
            href: "/charts/treemap-charts",
          },
        ],
      },
      {
        title: "Icons",
        iconName: "Smile",
        items: [
          {
            title: "Lucide",
            href: "/icons/lucide",
          },
          {
            title: "React Icons",
            href: "/icons/react-icons",
          },
        ],
      },
      {
        title: "Cards",
        iconName: "SquareSquare",
        items: [
          {
            title: "Basic",
            href: "/cards/basic",
          },
        ],
      },
    ],
  },
]


export const navigationsData: NavigationType[] =
  process.env.NODE_ENV === "development"
    ? allNavigationsData
    : allNavigationsData.filter((nav) => !nav.devOnly)

