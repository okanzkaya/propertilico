import React from 'react';
import USTaxModule from '../../components/app/TaxModuleUS';
import UKTaxModule from '../../components/app/UKTaxModule';
import AustralianTaxModule from '../../components/app/AustralianTaxModule';
import CanadianTaxModule from '../../components/app/CanadianTaxModule';
import GermanTaxModule from '../../components/app/TaxModuleDE';
import DefaultTaxModule from '../../components/app/TaxModuleDefault';  // Import the Default tax module

const TaxModule = ({ country, ...props }) => {
  switch (country) {
    case 'US':
      return <USTaxModule {...props} />;
    case 'UK':
      return <UKTaxModule {...props} />;
    case 'AU':
      return <AustralianTaxModule {...props} />;
    case 'CA':
      return <CanadianTaxModule {...props} />;
    case 'DE':
      return <GermanTaxModule {...props} />;
    default:
      return <DefaultTaxModule {...props} />;  // Use DefaultTaxModule for other countries
  }
};

export default TaxModule;
