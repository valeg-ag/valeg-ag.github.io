
class CalcCppGenerator {
    constructor(opts) {
        this.base_name = opts.base_name;
        this.calc_name_rus = opts.calc_name_rus;
    }

    generateInstructions() {
        let res =
`#instructions
`;
        return res;
    }

    generate() {
        let res =
`// ${this.base_name}Calc.h
///////////////////////////////////////////////////////////////////////////////
${this.generateHeaderFile()}\n\n\n
// ${this.base_name}Calc.cpp
///////////////////////////////////////////////////////////////////////////////
${this.generateCppFile()}\n\n\n
`
        return res;
    }

    generateHeaderFile() {
        let res = 
`#pragma once

struct ${this.base_name}Filter : CCopyClearBase< ${this.base_name}Filter >
{
};

class ${this.base_name}Calc : public CCalculation1
{
public:
  explicit ${this.base_name}Calc( const ${this.base_name}Filter& flt );
  ~${this.base_name}Calc() override;

  CStdString GetName() override;
  OMPCODE Calculation() override;

  OMP_DECLARE_PRIVATE( ${this.base_name}Calc );
};
`;
        return res;
    }

    generateCppFile() {
        let res = 
`#include "stdafx.h"

#include "./${this.base_name}Calc.h"
#include "OmUtils/OmpProtocol.h"
#include "uicore/RunTaskRegister.h"

class ${this.base_name}Calc::Private
{
public:
  Private( ${this.base_name}Calc& q_ ) : q{ q_ }
  {}

  ${this.base_name}Calc& q;
  ${this.base_name}Filter Flt;
  omp::Protocol Protocol;
};

${this.base_name}Calc::${this.base_name}Calc( const ${this.base_name}Filter& flt ) : d{ *new Private{ *this } }
{
  d.Flt = flt;
}

${this.base_name}Calc::~${this.base_name}Calc()
{
  delete &d;
}

CStdString ${this.base_name}Calc::GetName()
{
  return "${this.calc_name_rus}";
}

OMPCODE ${this.base_name}Calc::Calculation()
{
  d.Protocol.Attach( GetProtocolID() );

  Dialog()->SetProcessName1( "${this.calc_name_rus}" );
  Dialog()->SetRange1( 4321 );
  Dialog()->SetPos1( 0 );

  for( int i = 0; i < 4321; ++i )
  {
    auto stepItOnScopeExit = omp::guard_fun( [ & ]() { Dialog()->StepIt1(); } );

    // do something useful
  }

  d.Protocol.AddRow(
      omp::ProtocolRow{}
          .SetSection( "Результаты" )
          .SetInfo( COmpString{}.Format( "Вставлено записей: %d", d.InsertedCnt ) ) );

  return THREAD_CALCULATED;
}

namespace
{
const OMPCODE kTaskId = 1234_fix;
REGISTER_TASK_RUN_LIGHT( kTaskId, []() { ::RunThreadingReport( new CSSVReportDlg(), new ${this.base_name}Calc( {} ) ); } );
}
`;
        return res;
    }
};
