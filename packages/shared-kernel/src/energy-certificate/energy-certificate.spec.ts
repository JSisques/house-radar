import { describe, expect, it } from 'vitest';

import { ENERGY_CERTIFICATE_VALUES, EnergyCertificate } from './energy-certificate';
import { InvalidEnergyCertificateException } from './invalid-energy-certificate.exception';

describe('EnergyCertificate', () => {
  it('accepts letters A to G, in process, exempt and unknown (HR-F002-BR14)', () => {
    expect(ENERGY_CERTIFICATE_VALUES).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'in_process', 'exempt', 'unknown']);
    for (const value of ENERGY_CERTIFICATE_VALUES) expect(new EnergyCertificate(value).toPrimitives()).toBe(value);
  });

  it('models "in process" as a distinct value, not a letter (HR-F002-AC13)', () => {
    const inProcess = new EnergyCertificate('in_process');
    expect(inProcess.isLetter).toBe(false);
    expect(inProcess.equals(new EnergyCertificate('unknown'))).toBe(false);
    expect(new EnergyCertificate('A').isLetter).toBe(true);
  });

  it.each(['H', 'a', 'in process', ''])('rejects %j', (value) => {
    expect(() => new EnergyCertificate(value)).toThrow(InvalidEnergyCertificateException);
  });
});
