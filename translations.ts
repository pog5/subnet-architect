
export const translations = {
  en: {
    app: {
      title: "IPv4 Subnet Architect",
      description: "Visualize and calculate sub-network partitions with real-time bit analysis.",
      tip: "Tip: Click on any element (Cursor: ?) to learn how it works!",
    },
    config: {
      title: "Configuration",
      network_addr: "Network Address",
      network_addr_desc: "The starting IPv4 address.",
      subnet_mask: "Original Subnet Mask",
      subnet_mask_desc: "Current CIDR notation (0-32).",
      req_subnets: "Required Sub-networks",
      target_subnets: "Target: {count} subnets",
      req_bits: "Required bits: {count}",
      details: {
        gateway: "Gateway",
        broadcast: "Broadcast",
        old_mask: "(Old) Subnet Mask",
        new_mask: "(New) Subnet Mask"
      }
    },
    vis: {
      title: "Bit Allocation",
      total_bits: "32 Bits Total",
      legend: {
        net: "Network",
        sub: "Subnet",
        host: "Host"
      },
      octets: {
        header: "Octet"
      }
    },
    stats: {
      new_mask: "New Mask",
      hosts_per_subnet: "Hosts / Subnet"
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
        broadcast_ip: "Broadcast IP",
        range: "Usable Host Range",
        hosts: "Hosts"
      }
    },
    errors: {
      invalid_ip: "Invalid IP Address",
      invalid_cidr: "Invalid CIDR",
      min_subnet: "Must request at least 1 subnet",
      limit_display: "Display limited to first 2048 subnets for performance."
    },
    help: {
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
      broadcast_ip_math: "Broadcast IP - 1",
      close: "Close",
      mask_legend_masked: "1 (Masked)",
      mask_legend_unmasked: "0 (Unmasked)",
      mask_expl_new_html: "<strong>S</strong> bits are set to <strong class='text-green-600'>1</strong>, extending the network mask to cover subnets.",
      mask_expl_old_html: "<strong>S</strong> bits are <strong class='text-red-500'>0</strong>, treated as host bits in the original mask.",
      mask_tooltip_n: "Network (N)",
      mask_tooltip_s: "Subnet (S)",
      mask_tooltip_h: "Host (H)",
      details_gateway: {
        title: "Gateway / Network Address",
        content: "This is the starting IP address of your entire block. It acts as the identifier for the parent network before we split it."
      },
      details_broadcast: {
        title: "Supernet Broadcast",
        content: "This is the last IP of your entire block. It is calculated by keeping the Network bits (N) as is, and setting all Subnet (S) and Host (H) bits to 1."
      },
      details_old_mask: {
        title: "Old Subnet Mask",
        content: "This mask defines your original network size. The 'S' (Subnet) bits are currently 0 because they haven't been borrowed yet."
      },
      details_new_mask: {
        title: "New Subnet Mask",
        content: "This mask defines the size of your new, smaller subnets. The 'S' (Subnet) bits are now set to 1, effectively becoming part of the network portion."
      }
    }
  },
  bg: {
    app: {
      title: "IPv4 Подмрежов Архитект",
      description: "Визуализирайте и изчислявайте разделянето на подмрежи с анализ на битовете в реално време.",
      tip: "Съвет: Кликнете върху всеки елемент (Курсор: ?), за да научите как работи!",
    },
    config: {
      title: "Конфигурация",
      network_addr: "Мрежов Адрес",
      network_addr_desc: "Началният IPv4 адрес.",
      subnet_mask: "Оригинална Подмрежова Маска",
      subnet_mask_desc: "Текуща CIDR нотация (0-32).",
      req_subnets: "Изисквани Подмрежи",
      target_subnets: "Цел: {count} подмрежи",
      req_bits: "Изисквани битове: {count}",
      details: {
        gateway: "Гейтуей",
        broadcast: "Броудкаст",
        old_mask: "(Стара) Маска",
        new_mask: "(Нова) Маска"
      }
    },
    vis: {
      title: "Разпределение на Битове",
      total_bits: "32 Бита Общо",
      legend: {
        net: "Мрежа",
        sub: "Подмрежа",
        host: "Хост"
      },
      octets: {
        header: "Октет"
      }
    },
    stats: {
      new_mask: "Нова Маска",
      hosts_per_subnet: "Хостове / Подмрежа"
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
        broadcast_ip: "Броудкаст IP",
        range: "Използваем Хост Обхват",
        hosts: "Хостове"
      }
    },
    errors: {
      invalid_ip: "Невалиден IP адрес",
      invalid_cidr: "Невалиден CIDR",
      min_subnet: "Трябва да заявите поне 1 подмрежа",
      limit_display: "Показването е ограничено до първите 2048 подмрежи за производителност."
    },
    help: {
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
      broadcast_ip_math: "Броудкаст IP - 1",
      close: "Затвори",
      mask_legend_masked: "1 (Маскиран)",
      mask_legend_unmasked: "0 (Немаскиран)",
      mask_expl_new_html: "<strong>S</strong> битовете са зададени на <strong class='text-green-600'>1</strong>, разширявайки мрежовата маска, за да покрие подмрежите.",
      mask_expl_old_html: "<strong>S</strong> битовете са <strong class='text-red-500'>0</strong>, третирани като хост битове в оригиналната маска.",
      mask_tooltip_n: "Мрежа (N)",
      mask_tooltip_s: "Подмрежа (S)",
      mask_tooltip_h: "Хост (H)",
      details_gateway: {
        title: "Гейтуей / Мрежов Адрес",
        content: "Това е началният IP адрес на целия блок. Той действа като идентификатор за родителската мрежа, преди да я разделим."
      },
      details_broadcast: {
        title: "Супернет Броудкаст",
        content: "Това е последният IP на целия блок. Изчислява се, като Мрежовите битове (N) се запазват, а всички Подмрежови (S) и Хост (H) битове се задават на 1."
      },
      details_old_mask: {
        title: "Стара Подмрежова Маска",
        content: "Тази маска определя размера на оригиналната мрежа. Битовeте 'S' (Подмрежа) в момента са 0, защото още не са 'заети'."
      },
      details_new_mask: {
        title: "Нова Подмрежова Маска",
        content: "Тази маска определя размера на новите, по-малки подмрежи. Битовете 'S' (Подмрежа) вече са 1, ставайки част от мрежовия идентификатор."
      }
    }
  }
};