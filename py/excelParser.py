import re
import os
import pandas as pd
from os.path import isfile, join

#all classes of awp
awpClasses = {
    'LOW_SMART' : {
        'P130A' : '',
        'P160A' : ''
    },
    'SMART' : {
        'P170TXE-E' : '',
        'P200A-R' : '',
        'P200AXE' : '',
        'P200TXE-E' : '',
        'P220AXE-E' : '',
        'P240A' : '',
        'P240AXE' : ''
    },
    'LIGHT' :  {
        'P180BK' : '\d\d180\d+',
        'P220BK' : '\d\d220\d+',
        'P250BK' : '\d\d250\d+',
        'P280CK' : '\d\d280\d+',
        'P280B' : '\d\d280\d+'
    },
    'PREMIUM' : {
        'P300KS' : '\d\d300\d+',
        'P370KS' : '\d\d370\d+',
        'P370KSE' : '\d\d370\d+'
    },
    'JUMBO' : {
        'P480' : '\d\d480\d+',
        'P570' : '\d\d570\d+',
        'P640' : '\d\d640\d+',
        'P750' : '\d\d750\d+'
    },
    'TOP' : {
        'P900' : '\d\d900\d+'
    }
}

dataList = []

#class for the Excel Parser
#Includes all the needed functions to parse the Excel file
class ExcelParser:

    #saves the excel filename
    excelFilename = ''

    #describes all params which should be searched in the excel file
    propertiesToSearch = {
        'Nummer' : '',         #Bühnentyp in der Nummer
        'Kunde': '',
        'LKW-Hersteller und Typ': '',
        #'Fahrgestellnummer', im anderen Excel
        'VA leer': 'kg',
        'HA leer': 'kg',
        'Wiegeart': '',
        'Vorderachse': 'kg',
        'Hinterachse': 'kg',
        'Linke Seite': 'kg',
        'Rechte Seite': 'kg',
        'Tankgröße': 'l',
        'Tankinhalt': '%',
        'Radstand' : 'mm',
        'VA-Gewicht (zulässig)': 'kg',
        'HA1-Gewicht (zulässig)': 'kg',
        'HA2-Gewicht (zulässig)': 'kg',
        'Fahrzeuggewicht (zulässig)': 'kg',
        'Aufsetzmaß': 'mm',
        #Noch kein Zugriff im Excelsheet
        #'G_BASIS',
        #'LX_SP_BASIS',
        #'LZ_SP_Basis',
    }

    #includues all the excel files in the /excelFiles-folder
    excelFileList = [f for f in os.listdir('./excelFiles') if isfile(join('./excelFiles', f))]

    #initializes the ExcelParser with the filename
    def __init__(self,filename) -> None:
        self.excelFilename = filename

    #gets all the sheet names from an excel file
    def getSheetNames(file):
        df = pd.ExcelFile(file)
        return df.sheet_names

    #gets the location of a parameter in the excel file
    def getLocationOfParamInExcel(file, param):
        for sheet in ExcelParser.getSheetNames(file):
            df = pd.read_excel(file)
            for i in range(len(df)):
                for j in range(len(df.columns)):
                    if (df.iloc[i,j] == param):
                        return sheet,i,j

    #gets the location of the protocol date parameter in the excel file
    def getLocationOfProtocolDateParam(file):
        df = pd.read_excel(file, sheet_name='Standversuch')
        for i in range(len(df)):
            for j in range(len(df.columns)):
                    if (df.iloc[i,j] == 'Datum'):
                        return i,j

    #gets the value of a parameter in the excel file
    def getValFromParam(file, param):
        sheet, row, col = ExcelParser.getLocationOfParamInExcel(file, param)
        df = pd.read_excel(file, sheet_name=sheet)
        return df.iloc[row, col+2]

    #gets the value of the date
    def getProtocolDate(file):
        row, col = ExcelParser.getLocationOfProtocolDateParam(file)
        df = pd.read_excel(file, sheet_name='Standversuch')
        return str(df.iloc[row+1, col])[0:10]       #only take the date, not the time

    #pushes all the data into a list
    def pushParamValuePairIntoList(self):
        paramList = {}
        for param in ExcelParser.propertiesToSearch.keys():
            paramList[param] = ExcelParser.getValFromParam(self.excelFilename, param)
        paramList['Datum'] = ExcelParser.getProtocolDate(self.excelFilename)
        return paramList

    #creates a json file for all existing excel files
    def runParsing():
        for file in ExcelParser.excelFileList:
            newParser = ExcelParser('./excelFiles/'+file)
            newFilename = re.search('(\d\d\d\d\d\d\d\d)', file)
            dataList.append(newParser.pushParamValuePairIntoList())
        print("Finished parsing file: "+file)
            
#main

if __name__ == "__main__":
    ExcelParser.runParsing()

