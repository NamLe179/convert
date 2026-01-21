/**
 *  Symbol Identification Codes (SIDC) for Revision B
 *
 */

export interface SicElementsB {
  codingScheme: string;
  affiliation: string;
  battleDimension: string;
  status: string;
  functionId: string;
  context: string;
  modifier1: string;
  modifier2: string;
  echelon: string;
}

export class SidcB implements SicElementsB {
  codingScheme: string;
  affiliation: string;
  battleDimension: string;
  status: string;
  functionId: string;
  context: string;
  modifier1: string;
  modifier2: string;
  echelon: string;

  constructor(private sic: string = "SFGPU----------") {
    if (sic.length !== 15) {
      throw new Error("SIDC must be exactly 15 characters long for Revision B");
    }
    sic = sic.replaceAll("*", "-");
    this.codingScheme = sic.substring(0, 1);
    this.affiliation = sic.substring(1, 2);
    this.battleDimension = sic.substring(2, 3);
    this.status = sic.substring(3, 4) == "-" ? "P" : sic.substring(3, 4);
    this.functionId = sic.substring(4, 10);
    this.modifier1 = sic.substring(10, 11);
    this.modifier2 = sic.substring(11, 12);
    this.echelon = sic.substring(12, 13);
    this.context = sic.substring(13, 14);
  }

  toString() {
    // Đảm bảo độ dài sidc đúng 15 ký tự
    const cs = (this.codingScheme || "-").padEnd(1, "-").substring(0, 1);
    const af = (this.affiliation || "-").padEnd(1, "-").substring(0, 1);
    const bd = (this.battleDimension || "-").padEnd(1, "-").substring(0, 1);
    const st = (this.status || "P").padEnd(1, "-").substring(0, 1);
    const fi = (this.functionId || "------").padEnd(6, "-").substring(0, 6);
    const m1 = (this.modifier1 || "-").padEnd(1, "-").substring(0, 1);
    const m2 = (this.modifier2 || "-").padEnd(1, "-").substring(0, 1);
    const ec = (this.echelon || "-").padEnd(1, "-").substring(0, 1);
    const ct = (this.context || "-").padEnd(1, "-").substring(0, 1);
    
    return cs + af + bd + st + fi + m1 + m2 + ec + ct + "-";
  }
}
