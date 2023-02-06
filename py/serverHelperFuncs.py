from server import FlaskServer
from collections import OrderedDict
import re
import json

tabList = {
    'PREDUZ_FEST_C' : 'PREDUZ_FEST_C_\d',
    'HAW' : 'HAW_\d',
    'PFEST' : 'PFEST_\d',
    'PSTEIG' : 'PSTEIG_\d',
    'PNULL' : 'PNULL_\d',
    'DIVERS1' : 'ST[VH][LR]_[XZ]_\d|KDV_[XZ]G_SP|G_GES|M_KOGE',
    'DIVERS2' : 'KORR_STAND_([VH][LR])_([XZ])_(SCHMAL|BREIT)|Y_NEIG_PREDUZ_[ABCD]',
    'PREDUZ_B' : 'PREDUZ_B_\d',
    'PREDUZ_C' : 'PREDUZ_C_\d',
    'TELEHUB_NEIG_A' : 'TELEHUB_NEIG_A',
    'TELEHUB_NEIG_B' : 'TELEHUB_NEIG_B'
    }

def getLastSWVersionForFile(file):
    swVersion = (re.match('(\d\d)(\d\d\d)(\d\d\d)',file))
    lastSWVersion = '0'
    lastfile = ''
    for file in FlaskServer.parserJsonFileList:
        number = re.match('(\d\d)(\d\d\d)(\d\d\d)_(\d+)', file)
        if number.group(3) == swVersion.group(3):
            if int(number.group(4)) >= int(lastSWVersion):
                lastSWVersion = number.group(4)
                lastfile = number.group(0)
    return lastfile

def getLastSWVersionsForAllFiles():
  data = OrderedDict()
  i = 0
  while i < len(FlaskServer.parserJsonFileList):
    swVersion = (re.match('(\d\d)(\d\d\d)(\d\d\d)',FlaskServer.parserJsonFileList[i]))
    lastSWVersion = '0'
    lastfile = ''
    for file in FlaskServer.parserJsonFileList:
      number = re.match('(\d\d)(\d\d\d)(\d\d\d)_(\d+)', file)
      if number.group(3) == swVersion.group(3):
        i+=1
        if int(number.group(4)) >= int(lastSWVersion) or lastSWVersion == '':
          lastSWVersion = number.group(4)
          lastfile = number.group(0)
    data.update({swVersion.group(0):lastfile})
  return data


def getSWDataForFile(file,data):
    with open('./parserJsonFiles/'+getLastSWVersionForFile(file)+'.json')as f:
        jsonDict = json.load(f)
        for tab in tabList:
            tempDic = dict()
            for entry in jsonDict:
                if re.match(tabList[tab], entry):
                    tempDic.update({entry:jsonDict.get(entry)})
            data.append(tempDic)
        modelNr = re.search('(\d\d\d\d\d\d\d\d)',file).group(0)
        data.append(OrderedDict({'modelNr':modelNr}))
    return data
       
def getColNamesCodesys():
  with open('./parserJsonFiles/'+FlaskServer.parserJsonFileList[0])as f:
    jsonDict = json.load(f)
    colNameList = []
    for param in tabList:
      colnames = []
      for entry in jsonDict:
        if re.match(tabList[param], entry):
          colnames.append(entry)
      colNameList.append(colnames)
    return colNameList




            
