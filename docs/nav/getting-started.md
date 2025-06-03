# Getting Started

LiteX, as a SoC builder and library, directly supports the RISC-V trend by making RISC-V softcores instantiable. Specifically, VexRiscv RISC-V cores support is very mature with the availibilty to support both RTOS and Linux. 

RISC-V supports multiple types of interrupt controllers, depending on the implementation and platform as shown below : 


| Controller | Scope          | Interrupt Types           | Prioritization | Nesting | Use Case                      |
| ---------- | -------------- | ------------------------- | -------------- | ------- | ----------------------------- |
| **CLIC**   | Core-local     | Local + external          | Fine-grained   | Yes     | RTOS, embedded systems        |
| **PLIC**   | Platform-level | External (global)         | Coarse         | No      | Linux, multiprocessor systems |
| **CSRs**   | Core-local     | Timer, software, external | Minimal        | No      | Bare-metal, low-level control |



By integrating RISC-V CLIC support into the LiteX SoC framework, we aim to enhance LiteX with modern interrupt handling capabilities.
Instead it currently uses CLINT (Core-Local Interruptor), a memory-mapped peripheral for simple, non-virtualized RISC-V systems and test platforms.