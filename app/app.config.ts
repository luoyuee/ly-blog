export default defineAppConfig({
  ui: {
    colors: {
      primary: "blue",
      neutral: "neutral"
    },
    button: {
      slots: {
        base: "cursor-pointer"
      }
    },
    checkbox: {
      slots: {
        base: "cursor-pointer",
        label: "cursor-pointer"
      }
    },
    carousel: {
      slots: {
        dots: "dots",
        dot: "dot",
        item: "item",
        container: "container",
        arrows: "arrows",
        prev: "prev",
        next: "next"
      },
      variants: {
        active: {
          true: {
            dot: "bg-(--ui-border-inverted) active"
          }
        }
      }
    },
    formField: {
      slots: {
        root: "pb-4 relative",
        error: "text-xs absolute mt-0"
      }
    },
    input: {
      slots: {
        root: "w-full"
      }
    },
    inputTags: {
      slots: {
        root: "w-full"
      }
    },
    textarea: {
      slots: {
        root: "w-full"
      }
    },
    select: {
      slots: {
        base: "w-full"
      }
    },
    dropdownMenu: {
      variants: {
        active: {
          false: {
            item: "data-highlighted:before:bg-(--color-gray-50)/15 data-[state=open]:before:bg-(--color-gray-50)/15",
            itemLeadingIcon: "text-(--color-gray-400)"
          }
        }
      }
    }
  },
  log: {
    retention: 15
  }
});
