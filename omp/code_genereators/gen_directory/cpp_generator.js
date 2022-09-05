const TAB = "  ";

class DirectoryCppGenerator {
    /**
     * @param {object} opts
     */
    constructor(opts, columns) {
        this.entity = opts.entity;
        this.entities = opts.entities;
        this.entity_hr_name = opts.entity_hr_name;
        this.entities_hr_name = opts.entities_hr_name;
        this.non_ui_lib = opts.non_ui_lib;
        this.ui_lib = opts.ui_lib;
        this.columns = columns;
    }

    generate() {
        return `// ${this.dataHeaderFilePath()}
///////////////////////////////////////////////////////////////////////////////
${this.generateDataHeader()}\n\n\n
// ${this.non_ui_lib}/${this.entities}Service.h
///////////////////////////////////////////////////////////////////////////////
${this.generateServiceHeader()}\n\n\n
// ${this.non_ui_lib}/${this.entities}Service.cpp
///////////////////////////////////////////////////////////////////////////////
${this.generateServiceCpp()}\n\n\n
// ${this.ui_lib}/${this.entities}Cell.h
///////////////////////////////////////////////////////////////////////////////
${this.generateCellHeader()}\n\n\n
// ${this.ui_lib}/${this.entities}Cell.cpp
///////////////////////////////////////////////////////////////////////////////
${this.generateCellCpp()}\n\n\n
// ${this.ui_lib}/${this.entities}FilterCell.h
///////////////////////////////////////////////////////////////////////////////
${this.generateFilterCellHeader()}\n\n\n
// ${this.ui_lib}/${this.entities}FilterCell.cpp
///////////////////////////////////////////////////////////////////////////////
${this.generateFilterCellCpp()}\n\n\n
// ${this.ui_lib}/${this.entities}List.h
///////////////////////////////////////////////////////////////////////////////
${this.generateListHeader()}\n\n\n
// ${this.ui_lib}/${this.entities}List.cpp
///////////////////////////////////////////////////////////////////////////////
${this.generateListCpp()}
// ${this.ui_lib}/${this.entities}UiService.h
///////////////////////////////////////////////////////////////////////////////
${this.generateUiServiceHeader()}
// ${this.ui_lib}/${this.entities}UiService.cpp
///////////////////////////////////////////////////////////////////////////////
${this.generateUiServiceCpp()}`
    }

    generateDataHeader() {
        return `#pragma once\n
${this.generateDataStructCode()}\n
${this.generateFilterStructCode()}\n`
    }

    generateServiceHeader() {
        return `#pragma once
#include "OIDs.h"
#include "${this.dataHeaderFileName()}"

struct I${this.entities}Service : IOmpUnknown
{
  virtual void Insert( ${this.dataStruct()}& data ) = 0;
  virtual void Update( ${this.dataStruct()}& data ) = 0;
  virtual void Delete( const ${this.dataStruct()}& data ) = 0;

  virtual ${this.dataStruct()} LoadByCode( OMPCODE code ) = 0;
  virtual omp::shared_vec< ${this.dataStruct()} > LoadByFilter( const ${this.filterStruct()}& flt ) = 0;
};

DECLARE_DEFAULT_OID( I${this.entities}Service, OID_${this.entities}Service );\n`
    }

    generateServiceCpp() {
        return `#include "stdafx.h"

#include "OmUtils/SQLUtils.h"
#include "${this.entities}Service.h"
#include "core/MFieldDescStorage.h"

namespace ${this.namespace()}
{
// clang-format off
BEGIN_INC_FIELD_DESC_EX( FdImpl, ${this.dataStruct()}, "YOUR_TABLE"fix, "SQ_YOUR_TABLE"fix )
  AddSqlPK        ( "CODE"             , &Code );
  AddSqlField     ( "NUM"              , &Num );
END_INC_FIELD_DESC()
// clang-format on

class ServiceImpl : public I${this.entities}Service
{
public:
  void Insert( ${this.dataStruct()}& data ) override;
  void Update( ${this.dataStruct()}& data ) override;
  void Delete( const ${this.dataStruct()}& data ) override;

  ${this.dataStruct()} LoadByCode( OMPCODE code ) override;
  omp::shared_vec< ${this.dataStruct()} > LoadByFilter( const ${this.filterStruct()}& flt ) override;
};
}

OMP_OBJECT_ENTRY_AUTO_NS( OID_${this.entities}Service, ${this.namespace()}, ServiceImpl );

// clang-format off
void FdMakeWhere( TwQuery& query, const ${this.filterStruct()}& flt )
{
  using namespace omp::sql;

  filtering( query, flt.Codes, _ac( "A", "CODE" ) );
  filtering( query, flt.Num, _ac( "A", "NUM" ) );
}
// clang-format on

namespace ${this.namespace()}
{
using StorageT = StandardFdStorage< FdImpl, ${this.dataStruct()}, ${this.filterStruct()} >;

void ServiceImpl::Insert( ${this.dataStruct()}& data )
{
  StorageT().Insert( data );
}

void ServiceImpl::Update( ${this.dataStruct()}& data )
{
  StorageT().Update( data );
}

void ServiceImpl::Delete( const ${this.dataStruct()}& data )
{
  StorageT().Delete( data );
}

${this.dataStruct()} ServiceImpl::LoadByCode( OMPCODE code )
{
  return StorageT().LoadByCode( code );
}

omp::shared_vec< ${this.dataStruct()} > ServiceImpl::LoadByFilter( const ${this.filterStruct()}& flt )
{
  return StorageT().LoadByFilterShared( flt );
}
}\n`;
    }

    generateCellHeader() {
        return `#pragma once
#include "${this.dataHeaderFilePath()}"
#include "uicore/KMM/MQtProperties.h"

namespace ${this.namespace()}
{
class Cell : public ${this.dataStruct()},
             public IMCell,
             public IMSQLBase,
             public IMProperties,
             public IMQtProperties,
             public IMStyle
{
public:
  Cell();
  explicit Cell( const ${this.dataStruct()}& src );
  explicit Cell( const Cell& src );

  // IMCell
  void Clear() override;
  void Copy( const IMCell& src ) override;
  IMCell* Clone() const override;
  OMPCODE* GetCodePtr() override;

  // IMSQLBase
  void InsertRequest( TwQuery& query ) override;
  void UpdateRequest( TwQuery& query ) override;
  void DeleteRequest( TwQuery& query ) override;

  // IMProperties
  void EnumPropertyPages( MPropertyPageArray& pages ) override;
  CString GetCaptionName() override;

  // IMStyle
  bool GetStyle( CGXStyle& style, OMPCODE HID, CGXStyle& hStyle, MDataManager* pMng, bool readOnly ) override;
};
}\n`;
    }

    generateCellCpp() {
        return `#include "stdafx.h"

#include "${this.entities}Cell.h"
#include "${this.entities}FilterCell.h"
#include "OmOrdr/${this.entities}Service.h"
#include "uicore/KMM/MQtPropertyPage.h"
#include "uicore/SmartClearCopyCell.h"

#include "ui_${this.entities}CellPage.h"

namespace
{
enum
{
  ppMain = 1,
};
}

namespace ${this.namespace()}
{
Cell::Cell()
{}

Cell::Cell( const ${this.dataStruct()}& src )
{
  Clear();
  ${this.dataStruct()}::copy( src );
}

Cell::Cell( const Cell& src )
{
  Copy( src );
}

void Cell::Clear()
{
  ${this.dataStruct()}::clear();
  omp::SmartClearBase( *this );
}

void Cell::Copy( const IMCell& src )
{
  const auto& s = dynamic_cast< const Cell& >( src );
  ${this.dataStruct()}::copy( s );
  omp::SmartCopyBase( *this, src );
}

IMCell* Cell::Clone() const
{
  return new Cell( *this );
}

OMPCODE* Cell::GetCodePtr()
{
  return &Code;
}

void Cell::InsertRequest( TwQuery& query )
{
  COmpPtr< I${this.entities}Service > service;
  service->Insert( *this );
}

void Cell::UpdateRequest( TwQuery& query )
{
  COmpPtr< I${this.entities}Service > service;
  service->Update( *this );
}

void Cell::DeleteRequest( TwQuery& query )
{
  COmpPtr< I${this.entities}Service > service;
  service->Delete( *this );
}

class UiCellPage : public IQtUiFormMixin< UiCellPage, Ui::${this.entities}CellPage >
{
public:
  UiCellPage( Cell& data_ ) : data{ data_ }
  {}

  void onInitDialog( MQtPropertyPageWidget* wgt ) override;
  void doDataExchange( QtDataExchange& dx ) override;

public:
  Cell& data;
};

void Cell::EnumPropertyPages( MPropertyPageArray& pages )
{
  pages.Add( new MQtPropertyPage( ppMain, this, new UiCellPage( *this ) ) );
}

CString Cell::GetCaptionName()
{
  return "${this.entity_hr_name}";
}

bool Cell::GetStyle( CGXStyle& style, OMPCODE HID, CGXStyle& hStyle, MDataManager* pMng, bool readOnly )
{
  switch( HID )
  {
    case FilterCell::Hid_Num:
      style.SetValue( Num );
      return true;
  }

  return IMStyle::GetStyle( style, HID, hStyle, pMng, readOnly );
}

void UiCellPage::onInitDialog( MQtPropertyPageWidget* wgt )
{}

void UiCellPage::doDataExchange( QtDataExchange& dx )
{
  DDX_QtString( dx, leNum, data.Num );
}
}\n`;
    }

    generateFilterCellHeader() {
        return `#pragma once
#include "${this.dataHeaderFilePath()}"
#include "uicore/KMM/MQtProperties.h"
#include "uicore/KMM/MXMLFilter.h"
#include "uicore/MBrowserSupport.h"

namespace ${this.namespace()}
{
class FilterCell : public ${this.filterStruct()},
                   public IMCell,
                   public IMProperties,
                   public IMQtProperties,
                   public IMXMLFilter,
                   public IMHeader,
                   public IMBrowserSupport
{
public:
  FilterCell();
  explicit FilterCell( const ${this.filterStruct()}& src );
  explicit FilterCell( const FilterCell& src );

  // IMCell
  void Clear() override;
  void Copy( const IMCell& src ) override;
  IMCell* Clone() const override;

  // IMProperties
  CString GetCaptionName() override;
  void EnumPropertyPages( MPropertyPageArray& pages ) override;

  // IMXMLFilter
  OMPCODE GetReportType() override;
  void SerializeXMLData( XMLNode node, bool bLoad ) override;
  void EnumHistoryComboQt( omp::vector< COmpString >& hc ) override;

  // IMHeader
  void GetHeader( ITTPArray< CGXStyle >& header ) override;

  enum enHids
  {
    Hid_Num = 1,
  };
};
}\n`;
    }

    generateFilterCellCpp() {
        return `#include "stdafx.h"

#include "${this.entities}FilterCell.h"
#include "uicore/KMM/MQtPropertyPage.h"
#include "uicore/SmartClearCopyCell.h"

#include "ui_${this.entities}FilterPage.h"

namespace
{
enum
{
  ppMain = 1,
};
}

namespace ${this.namespace()}
{
FilterCell::FilterCell()
{
  Clear();
}

FilterCell::FilterCell( const FilterCell& src )
{
  Copy( src );
}

FilterCell::FilterCell( const ${this.filterStruct()}& src )
{
  Clear();
  ${this.filterStruct()}::copy( src );
}

void FilterCell::Clear()
{
  omp::SmartClearCell( *this );
}

void FilterCell::Copy( const IMCell& src )
{
  omp::SmartCopyCell( *this, src );
}

IMCell* FilterCell::Clone() const
{
  return new FilterCell( *this );
}

class UiFilterPage : public IQtUiFormMixin< UiFilterPage, Ui::${this.entities}FilterPage >
{
public:
  UiFilterPage( FilterCell& data_ ) : data{ data_ }
  {}

  void onInitDialog( MQtPropertyPageWidget* wgt ) override;
  void doDataExchange( QtDataExchange& dx ) override;

public:
  FilterCell& data;
};

CString FilterCell::GetCaptionName()
{
  return "${this.entities_hr_name}";
}

void FilterCell::EnumPropertyPages( MPropertyPageArray& pages )
{
  pages.Add( new MQtPropertyPage( ppMain, this, new UiFilterPage( *this ) ) );
}

OMPCODE FilterCell::GetReportType()
{
  return 123456_СГЕНЕРИРОВАТЬ;
}

void FilterCell::SerializeXMLData( XMLNode node, bool bLoad )
{
  BeginXMLVarGroup( "${this.entities}_FilterCell" );

  SerializeXMLVar( Num );
}

void FilterCell::EnumHistoryComboQt( omp::vector< COmpString >& hc )
{
  hc.push_back( "cbNum" );
}

void FilterCell::GetHeader( ITTPArray< CGXStyle >& header )
{
  AddHeaderColumn( header, "Номер", Hid_Num );
  IMHeader::SetWrapText( header, true );
}

void UiFilterPage::onInitDialog( MQtPropertyPageWidget* wgt )
{}

void UiFilterPage::doDataExchange( QtDataExchange& dx )
{
  DDX_QtLikeSensString( dx, cbNum, cbNumCs, data.Num );
}
}\n`;
    }

    generateListHeader() {
        return `#pragma once

namespace ${this.namespace()}
{
class List : public MDataManager
{
  DECLARE_DYNCREATE( List )

public:
  List();
  ~List() override;

  void GetReportCaptionStr( CString& caption ) override;

  void LoadData( OMPCODE reporttype, IMCell* flt ) override;

  IMCell* GetNewChild() override;

  OMP_DECLARE_PRIVATE( List );
};
}\n`;
    }

    generateUiServiceHeader() {
        return `#pragma once
#include "OIDs.h"
#include "${this.non_ui_lib}/${this.entities}Data.h"

struct ${this.entities}BrowserParams : CCopyClearBase< ${this.entities}BrowserParams >
{
  bool IsMultiSelect{ false };
};

struct I${this.entities}UiService : IOmpUnknown
{
  virtual omp::shared_vec< ${this.dataStruct()} > RunBrowser( const ${this.filterStruct()} flt, const ${this.entities}BrowserParams& params ) = 0;
};

DECLARE_DEFAULT_OID( I${this.entities}UiService, OID_${this.entities}UiService );\n`;
    }

    generateUiServiceCpp() {
        return `#include "stdafx.h"

#include "${this.entities}Cell.h"
#include "${this.entities}FilterCell.h"
#include "${this.entities}List.h"
#include "${this.entities}UiService.h"
#include "uicore/BrowserProvider.h"

namespace ${this.namespace()}
{
class ServiceImpl : public I${this.entities}UiService
{
public:
  omp::shared_vec< ${this.dataStruct()} > RunBrowser( const ${this.filterStruct()} flt, const ${this.entities}BrowserParams& params ) override;
};
}

OMP_OBJECT_ENTRY_AUTO_NS( OID_${this.entities}UiService, ${this.namespace()}, ServiceImpl );

namespace ${this.namespace()}
{
omp::shared_vec< ${this.dataStruct()} >
ServiceImpl::RunBrowser( const ${this.filterStruct()} flt, const ${this.entities}BrowserParams& params )
{
  FilterCell filter;
  List list;

  CBrowserProvider browserProvider{ list, filter };
  browserProvider.SetMultiSelect( params.IsMultiSelect );

  if( IDOK != browserProvider.DoModal() )
    return {};

  omp::shared_vec< ${this.dataStruct()} > result;
  for( const auto* cell : omp::cast_container< Cell* >( browserProvider.GetSelected() ) )
    result.emplace_back( std::make_shared< ${this.dataStruct()} >( *cell ) );

  return result;
}
}\n`;
    }

    generateListCpp() {
        return `#include "stdafx.h"

#include "${this.non_ui_lib}/${this.entities}Service.h"
#include "${this.entities}Cell.h"
#include "${this.entities}FilterCell.h"
#include "${this.entities}List.h"

namespace ${this.namespace()}
{
class List::Private
{
public:
  Private( List& q_ ) : q{ q_ }
  {}

  List& q;
};

IMPLEMENT_DYNCREATE( List, MDataManager )

List::List() : d{ *new Private{ *this } }
{}

List::~List()
{
  delete &d;
}

void List::GetReportCaptionStr( CString& caption )
{
  caption = "${this.entities_hr_name}";
}

void List::LoadData( OMPCODE reporttype, IMCell* flt )
{
  const auto& f = dynamic_cast< FilterCell& >( *flt );

  COmpPtr< I${this.entities}Service > service;
  auto dataVec{ service->LoadByFilter( f ) };

  for( const auto& data : dataVec )
    AddCell( new Cell( *data ) );

  LoadAutoColumnsData();
}

IMCell* List::GetNewChild()
{
  return new Cell();
}
}

IMCell* Get${this.entities}Filter( const OmpReportParams& )
{
  return new ${this.namespace()}::FilterCell();
}

void Run${this.entities}List( const IMCell& f )
{
  RunOMPDocReport( RUNTIME_CLASS( ${this.namespace()}::List ), f.Clone() );
}\n`;
    }

    generateCellPageUi() {
        return `<?xml version="1.0" encoding="UTF-8"?>
<ui version="4.0">
 <class>${this.entities}CellPage</class>
 <widget class="QWidget" name="${this.entities}CellPage">
  <property name="geometry">
   <rect>
    <x>0</x>
    <y>0</y>
    <width>345</width>
    <height>144</height>
   </rect>
  </property>
  <property name="windowTitle">
   <string>Свойства</string>
  </property>
  <layout class="QVBoxLayout" name="verticalLayout">
   <item>
    <layout class="QGridLayout" name="gridLayout">
     <item row="0" column="0">
      <widget class="QLabel" name="label">
       <property name="text">
        <string>Номер: </string>
       </property>
      </widget>
     </item>
     <item row="0" column="1">
      <widget class="QLineEdit" name="leNum"/>
     </item>
    </layout>
   </item>
   <item>
    <spacer name="verticalSpacer">
     <property name="orientation">
      <enum>Qt::Vertical</enum>
     </property>
     <property name="sizeHint" stdset="0">
      <size>
       <width>20</width>
       <height>103</height>
      </size>
     </property>
    </spacer>
   </item>
  </layout>
 </widget>
 <resources/>
 <connections/>
</ui>\n`;
    }

    generateFilterCellPageUi() {
        return `<?xml version="1.0" encoding="UTF-8"?>
<ui version="4.0">
 <class>${this.entities}FilterPage</class>
 <widget class="QWidget" name="${this.entities}FilterPage">
  <property name="geometry">
   <rect>
    <x>0</x>
    <y>0</y>
    <width>321</width>
    <height>196</height>
   </rect>
  </property>
  <property name="windowTitle">
   <string>Фильтр</string>
  </property>
  <layout class="QVBoxLayout" name="verticalLayout">
   <item>
    <layout class="QGridLayout" name="gridLayout">
     <item row="0" column="0">
      <widget class="QLabel" name="label">
       <property name="text">
        <string>Номер: </string>
       </property>
      </widget>
     </item>
     <item row="0" column="1">
      <widget class="QOmpComboBox" name="cbNum">
       <property name="sizePolicy">
        <sizepolicy hsizetype="Expanding" vsizetype="Fixed">
         <horstretch>0</horstretch>
         <verstretch>0</verstretch>
        </sizepolicy>
       </property>
       <property name="editable">
        <bool>true</bool>
       </property>
      </widget>
     </item>
     <item row="0" column="2">
      <widget class="QOmpComboBox" name="cbNumCs">
       <property name="sizeAdjustPolicy">
        <enum>QComboBox::AdjustToContents</enum>
       </property>
      </widget>
     </item>
    </layout>
   </item>
   <item>
    <spacer name="verticalSpacer">
     <property name="orientation">
      <enum>Qt::Vertical</enum>
     </property>
     <property name="sizeHint" stdset="0">
      <size>
       <width>20</width>
       <height>153</height>
      </size>
     </property>
    </spacer>
   </item>
  </layout>
 </widget>
 <customwidgets>
  <customwidget>
   <class>QOmpComboBox</class>
   <extends>QComboBox</extends>
   <header>qompcombobox.h</header>
  </customwidget>
 </customwidgets>
 <resources/>
 <connections/>
</ui>\n`;
    }

    generateInstructions() {
        return `
        #instructions

Add next lines to to \`${this.ui_lib}/${this.ui_lib}Run.cpp\`:

\`\`\`cpp
run${this.entities} = "TASK_CODE"fix, // ${this.entities_hr_name}

// ...
OMP_RUN( run${this.entities}, Get${this.entities}Filter, Run${this.entities}List )
\`\`\`

Add next lines to to \`core/OIDs.h\`:
\`\`\`cpp
#define OID_${this.entities}Service (${this.non_ui_lib} + ?)

#define OID_${this.entities}UiService (${this.ui_lib} + ?)
\`\`\`
`;
    }

    generateDataStructCode() {
        const members = this.columns.map(col => `\n${TAB}${this.generateDataMemberTypeCode(col)} ${col.dataMemberName};`);
        return `struct ${this.dataStruct()} : CCopyClearBase< ${this.dataStruct()} >\n{${members.join("")}\n};`;
    }

    generateFilterStructCode() {
        const members = this.columns.filter(col => !!col.filterMemberName)
            .map(col => `\n${TAB}${col.filterMemberType} ${col.filterMemberName};`);
        return `struct ${this.filterStruct()} : CCopyClearBase< ${this.filterStruct()} >\n{${members.join("")}\n};`;
    }

    namespace() { return `${this.entities}`; }

    dataStruct() { return `${this.entity}Data`; }

    filterStruct() { return `${this.entities}Filter`; }

    dataHeaderFilePath() { return `${this.non_ui_lib}/${this.dataHeaderFileName()}`; }

    dataHeaderFileName() { return `${this.entities}Data.h`; }

    generateDataMemberTypeCode(col) {
        if (col.dataMemberType === "COmpStringT") {
            return `COmpStringT< ${col.columnDataLength} >`;
        }
        return `${col.dataMemberType}`;
    }
}

function generateNewDirectoryCpp(opts, columns) {
    return new DirectoryCppGenerator(opts, columns).generate();
}
