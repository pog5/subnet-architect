export const translations = {
  en: {
    app: {
      title: "Subnet Architect",
      ipv4: "IPv4",
      ipv6: "IPv6",
      description: "Visualize and calculate network partitions with real-time bit analysis.",
      tip: "Tip: Click on any element (Cursor: ?) to learn how it works!",
    },
    config: {
      title: "Configuration",
      network_addr: "Network Address",
      network_addr_desc: "The starting IP address.",
      subnet_mask: "Original Prefix / Mask",
      subnet_mask_desc: "Current CIDR notation (0-{max}).",
      req_subnets: "Required Sub-networks",
      target_subnets: "Target: {count} subnets",
      req_bits: "Required bits: {count}",
      details: {
        gateway: "Gateway / First IP",
        broadcast: "Broadcast / Last IP",
        old_mask_v4: "(Old) Subnet Mask",
        new_mask_v4: "(New) Subnet Mask",
        old_mask_v6: "(Old) Prefix",
        new_mask_v6: "(New) Prefix"
      }
    },
    vis: {
      title: "Bit Allocation",
      total_bits: "{bits} Bits Total",
      legend: {
        net: "Network",
        sub: "Subnet",
        host: "Host"
      },
      octets: {
        header: "Segment"
      }
    },
    stats: {
      new_mask: "New Prefix",
      hosts_per_subnet: "Hosts / Subnet",
      new_prefix_help: "New Prefix Calculation"
    },
    table: {
      title: "Allocation Table",
      showing: "Showing {count} partitions",
      empty: "Enter valid IP details to generate subnets.",
      loading: "Calculating...",
      headers: {
        index: "#",
        subnet_bits: "Subnet Bits",
        network_ip: "Network IP",
        broadcast_ip: "End IP",
        range: "Range",
        hosts: "Hosts"
      }
    },
    errors: {
      invalid_ip: "Invalid IP Address",
      invalid_cidr: "Invalid CIDR/Prefix",
      min_subnet: "Must request at least 1 subnet",
      limit_display: "Display limited for performance."
    },
    help: {
      // ... existing help keys ...
      first_subnet: "First Subnet (Index 0)",
      start_counting: "We start counting at 0.",
      previous: "Previous",
      current: "Current",
      binary_expl: "Binary counting works by adding 1 to the previous value.",
      highlight_expl: "Highlighted bits flipped during the carry operation.",
      reserved: "Reserved",
      cannot_use: "Cannot be used",
      talks_to_all: "Talks to all",
      first_usable: "First Usable",
      last_usable: "Last Usable",
      network_ip_math: "Network IP + 1",
      broadcast_ip_math: "End IP - 1",
      close: "Close",
      mask_legend_masked: "1 (Masked)",
      mask_legend_unmasked: "0 (Unmasked)",
      mask_expl_new_html: "<strong>S</strong> bits are set to <strong class='text-green-600'>1</strong>, extending the network mask to cover subnets.",
      mask_expl_old_html: "<strong>S</strong> bits are <strong class='text-red-500'>0</strong>, treated as host bits in the original mask.",
      mask_tooltip_n: "Network (N)",
      mask_tooltip_s: "Subnet (S)",
      mask_tooltip_h: "Host (H)",
      details_gateway: {
        title: "Gateway",
        content: "This is the first IP address of the block (Network + 1). In IPv4 it is commonly assigned to the router. In IPv6, the first address (0000...) is Subnet-Router Anycast, so the first usable host is usually +1."
      },
      details_broadcast: {
        title: "Broadcast / End IP",
        content: "The last IP of the block. In IPv4 this is the Broadcast address. In IPv6, there is no broadcast, but this represents the end of the calculated range."
      },
      details_old_mask: {
        title: "Old Prefix",
        content: "This prefix defines your original network size. The 'S' (Subnet) bits are currently 0."
      },
      details_new_mask: {
        title: "New Prefix",
        content: "This prefix defines the size of your new, smaller subnets. The 'S' (Subnet) bits are now part of the network identifier."
      }
    }
  },
  bg: {
    app: {
      title: "Подмрежов Архитект",
      ipv4: "IPv4",
      ipv6: "IPv6",
      description: "Визуализирайте и изчислявайте разделянето на подмрежи с анализ на битовете в реално време.",
      tip: "Съвет: Кликнете върху всеки елемент (Курсор: ?), за да научите как работи!",
    },
    config: {
      title: "Конфигурация",
      network_addr: "Мрежов Адрес",
      network_addr_desc: "Началният IP адрес.",
      subnet_mask: "Оригинален Префикс",
      subnet_mask_desc: "Текуща CIDR нотация (0-{max}).",
      req_subnets: "Изисквани Подмрежи",
      target_subnets: "Цел: {count} подмрежи",
      req_bits: "Изисквани битове: {count}",
      details: {
        gateway: "Гейтуей / Първи",
        broadcast: "Броудкаст / Последен",
        old_mask_v6: "(Стар) Префикс",
        new_mask_v6: "(Нов) Префикс",
        old_mask_v4: "(Стара) Маска",
        new_mask_v4: "(Нова) Маска"
      }
    },
    vis: {
      title: "Разпределение на Битове",
      total_bits: "{bits} Бита Общо",
      legend: {
        net: "Мрежа",
        sub: "Подмрежа",
        host: "Хост"
      },
      octets: {
        header: "Сегмент"
      }
    },
    stats: {
      new_mask: "Нов Префикс",
      hosts_per_subnet: "Хостове / Подмрежа",
      new_prefix_help: "Изчисляване на Нов Префикс"
    },
    table: {
      title: "Таблица за Разпределение",
      showing: "Показани {count} дяла",
      empty: "Въведете валидни данни, за да генерирате подмрежи.",
      loading: "Изчисляване...",
      headers: {
        index: "#",
        subnet_bits: "Подмрежови Битове",
        network_ip: "Мрежов IP",
        broadcast_ip: "Краен IP",
        range: "Обхват",
        hosts: "Хостове"
      }
    },
    errors: {
      invalid_ip: "Невалиден IP адрес",
      invalid_cidr: "Невалиден CIDR/Префикс",
      min_subnet: "Трябва да заявите поне 1 подмрежа",
      limit_display: "Показването е ограничено за производителност."
    },
    help: {
      // ... same help keys ...
      first_subnet: "Първа подмрежа (Индекс 0)",
      start_counting: "Започваме броенето от 0.",
      previous: "Предишен",
      current: "Текущ",
      binary_expl: "Двоичното броене работи чрез добавяне на 1 към предишната стойност.",
      highlight_expl: "Маркираните битове се обръщат по време на преноса.",
      reserved: "Запазен",
      cannot_use: "Не може да се използва",
      talks_to_all: "Говори с всички",
      first_usable: "Първи използваем",
      last_usable: "Последен използваем",
      network_ip_math: "Мрежов IP + 1",
      broadcast_ip_math: "Краен IP - 1",
      close: "Затвори",
      mask_legend_masked: "1 (Маскиран)",
      mask_legend_unmasked: "0 (Немаскиран)",
      mask_expl_new_html: "<strong>S</strong> битовете са зададени на <strong class='text-green-600'>1</strong>, разширявайки мрежовата маска, за да покрие подмрежите.",
      mask_expl_old_html: "<strong>S</strong> битовете са <strong class='text-red-500'>0</strong>, третирани като хост битове в оригиналната маска.",
      mask_tooltip_n: "Мрежа (N)",
      mask_tooltip_s: "Подмрежа (S)",
      mask_tooltip_h: "Хост (H)",
      details_gateway: {
        title: "Гейтуей",
        content: "Това е първият IP адрес на блока (Мрежа + 1). В IPv4 често е рутера. В IPv6 адресът с всички нули е Subnet-Router Anycast, затова първият хост обикновено е +1."
      },
      details_broadcast: {
        title: "Броудкаст / Краен IP",
        content: "Последният IP на блока. В IPv4 това е Броудкаст адресът. В IPv6 няма броудкаст, но това представлява края на изчисления обхват."
      },
      details_old_mask: {
        title: "Стар Префикс",
        content: "Този префикс определя размера на оригиналната мрежа. Битовeте 'S' (Подмрежа) в момента са 0."
      },
      details_new_mask: {
        title: "Нов Префикс",
        content: "Този префикс определя размера на новите, по-малки подмрежи. Битовете 'S' (Подмрежа) вече са част от мрежовия идентификатор."
      }
    }
  }
};