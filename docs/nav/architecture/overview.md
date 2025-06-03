# Overview

This diagram shows how PLIC handles external interrupt distribution while CLIC provides advanced local interrupt management, creating a comprehensive interrupt handling solution for the VexRiscv cluster.


``` bash
  ┌───────────────────────────────────────────────────────────────────────────────────────┐
  │                            VexRiscv SMP Cluster with PLIC + CLIC                      │
  ├───────────────────────────────────────────────────────────────────────────────────────┤
  │                                                                                       │
  │  External Interrupt Sources                    Memory-Mapped I/O                      │
  │  ┌─────────────────────────┐                   ┌─────────────────────────┐            │
  │  │ interrupts[31:1]        │                   │  Wishbone Peripheral    │            │
  │  │ • UART                  │                   │  Bus (30-bit addr)      │            │
  │  │ • GPIO                  │                   │  ┌─────┬─────┬─────┐    │            │
  │  │ • Ethernet              │                   │  │UART │GPIO │Timer│    │            │
  │  │ • DMA                   │                   │  │     │     │     │    │            │
  │  │ • ...                   │                   │  └─────┴─────┴─────┘    │            │
  │  └─────────────┬───────────┘                   └─────────────────────────┘            │
  │                │                                                                      │
  │                ▼                                                                      │
  │  ┌────────────────────────────────────────────────────────────────────────────────┐   │
  │  │                              PLIC (Platform-Level Interrupt Controller)        │   │
  │  │  ┌─────────────┐    ┌─────────────────┐    ┌────────────────────────────────┐  │   │
  │  │  │   Gateway   │    │   Priority      │    │        Targets                 │  │   │
  │  │  │   Logic     │    │   Arbitration   │    │  ┌──────────┬──────────────┐   │  │   │
  │  │  │             │    │                 │    │  │ Machine  │ Supervisor   │   │  │   │
  │  │  │ Edge Detect │───▶│ Tree-based      │───▶│  │ Mode     │ Mode         │   │  │   │
  │  │  │ & Latching  │    │ Priority        │    │  │ Target   │ Target       │   │  │   │
  │  │  │             │    │ Selection       │    │  └──────────┴──────────────┘   │  │   │
  │  │  └─────────────┘    └─────────────────┘    └────────────┬───────────────────┘  │   │
  │  │                                                         │                      │   │
  │  │  Wishbone Interface (20-bit addr)                       │                      │   │
  │  │  • Priority registers                                   │                      │   │
  │  │  • Enable registers                                     │                      │   │
  │  │  • Threshold registers                                  │                      │   │
  │  │  • Claim/Complete registers                             │                      │   │
  │  └─────────────────────────────────────────────────────────┼──────────────────────┘   │
  │                                                            │                          │
  │                                                            ▼                          │
  │  ┌────────────────────────────────────────────────────────────────────────────────┐   │
  │  │                        CLIC (Core Local Interrupt Controller)                  │   │
  │  │                                                                                │   │
  │  │  External Inputs from PLIC:          Local Interrupt Sources:                  │   │
  │  │  ┌─────────────────────────┐          ┌─────────────────────────┐              │   │
  │  │  │ • Machine External      │          │ • Timer Compare         │              │   │
  │  │  │ • Supervisor External   │          │   (MTIMECMP vs MTIME)   │              │   │
  │  │  │                         │          │ • Software Trigger      │              │   │
  │  │  └────────────────────────┬┘          │   (MSIP register)       │              │   │
  │  │                           │           └─────────────────────────┘              │   │
  │  │                           ▼                         ▼                          │   │
  │  │  ┌─────────────────────────────────────────────────────────────────────────┐   │   │
  │  │  │                    Interrupt Processing Engine                          │   │   │
  │  │  │                                                                         │   │   │
  │  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐   │   │   │
  │  │  │  │   Level      │  │   Priority   │  │        Vectoring             │   │   │   │
  │  │  │  │  Comparison  │  │  Arbitration │  │                              │   │   │   │
  │  │  │  │              │  │              │  │  • Interrupt ID Assignment   │   │   │   │
  │  │  │  │ vs Threshold │  │ Nested Int.  │  │  • Handler Address Calc      │   │   │   │
  │  │  │  │              │  │ Support      │  │  • Context Auto-save         │   │   │   │
  │  │  │  └──────────────┘  └──────────────┘  └──────────────────────────────┘   │   │   │
  │  │  └─────────────────────────────────────────────────────────────────────────┘   │   │
  │  │                                                                                │   │
  │  │  Wishbone Interface (14-bit addr):                                             │   │
  │  │  • mintthresh, mtvt, mnxti CSRs                                                │   │
  │  │  • Per-interrupt config/enable/pending                                         │   │
  │  │  • Timer registers (MTIME/MTIMECMP)                                            │   │
  │  └─────────────────────────────────────┬──────────────────────────────────────────┘   │
  │                                        │                                              │
  │                                        ▼                                              │
  │  ┌────────────────────────────────────────────────────────────────────────────────┐   │
  │  │                              VexRiscv CPU Core                                 │   │
  │  │                                                                                │   │
  │  │  CLIC Interface:                         Memory Interfaces:                    │   │
  │  │  ┌─────────────────────────┐              ┌─────────────────────────┐          │   │
  │  │  │ • interrupt_valid       │              │ • iBus (Instruction)    │          │   │
  │  │  │ • interrupt_id[7:0]     │              │ • dBus (Data)           │          │   │
  │  │  │ • interrupt_level[7:0]  │              │                         │          │   │
  │  │  │ • interrupt_priv[1:0]   │              │ Cache: I$ 4KB, D$ 4KB   │          │   │
  │  │  │ • mtvec_addr[31:0]      │              │ Width: 32-bit           │          │   │
  │  │  │ • mtvec_mode[1:0]       │              └─────────────────────────┘          │   │
  │  │  └─────────────────────────┘                                                   │   │
  │  │                                                                                │   │
  │  │  Additional CSRs:                                                              │   │
  │  │  • mintthresh, mtvt, mnxti, mintstatus                                         │   │
  │  │  • mscratchcsw, mnscratchcsw                                                   │   │
  │  │                                                                                │   │
  │  └────────────────────────────────────────────────────────────────────────────────┘   │
  │                                        │                                              │
  │                                        ▼                                              │
  │  ┌────────────────────────────────────────────────────────────────────────────────┐   │
  │  │                              Memory System                                     │   │
  │  │                                                                                │   │
  │  │  ┌─────────────────────┐              ┌─────────────────────────────────────┐  │   │
  │  │  │   DRAM Bridges      │              │          Debug Interface            │  │   │
  │  │  │                     │              │                                     │  │   │
  │  │  │ • iBridge (64-bit)  │              │ • JTAG Debug Port                   │  │   │
  │  │  │ • dBridge (64-bit)  │              │ • OpenOCD Support                   │  │   │
  │  │  │                     │              │ • Hardware Breakpoints              │  │   │
  │  │  └─────────────────────┘              └─────────────────────────────────────┘  │   │
  │  └────────────────────────────────────────────────────────────────────────────────┘   │
  │                                                                                       │
  └───────────────────────────────────────────────────────────────────────────────────────┘


```


Key Interrupt Flow as shown in above daigram:

1. External interrupts[31:1] → PLIC Gateway → Priority Arbitration → Target Selection
2. PLIC outputs (Machine/Supervisor external) → CLIC External Inputs
3. CLIC Timer/Software logic → CLIC Processing Engine
4. CLIC combines all sources → Level comparison → Vectored delivery to CPU
5. CPU receives unified interrupt interface with ID, level, privilege, and vector address

Benefits of PLIC + CLIC Architecture:

* PLIC: System-wide external interrupt distribution and prioritization
* CLIC: Advanced per-hart interrupt management with vectoring and preemption
* Unified: Single interrupt interface to CPU with enhanced capabilities
* Scalable: Easy to extend to multiple cores while maintaining per-hart CLIC benefits
