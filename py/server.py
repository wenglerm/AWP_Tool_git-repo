from flask import Flask
from flask_cors import CORS
import os
import json
import sys
import re
from serverHelperFuncs import *


class FlaskServer:
    app = Flask(__name__)
    port = 5000
    CORS(app)
    jsonFileList = [f for f in os.listdir('./jsonFiles') if os.path.isfile(os.path.join('./jsonFiles', f))]
    parserJsonFileList = [f for f in os.listdir('./parserJsonFiles') if os.path.isfile(os.path.join('./parserJsonFiles', f))]

    #V01

    @app.route('/')
    def index():
        return 'hello, welcome to the AWP_tool server!'

    @app.route('/awpClasses')
    def getAwpClasses():
        with open('./jsonFiles/awpClasses.json') as f:
            data = json.load(f)
        return data

    @app.route('/properties')
    def getProperties():
        excelColNames = []
        swColNames = getColNamesCodesys()
        with open('./jsonFiles/propertiesToSearch.json') as f:
            excelColNames.append(list(json.load(f)))
        return excelColNames + swColNames

    @app.route('/awpClasses/<nr>')
    def getAwpClass(nr):
        files = nr.split(',')
        data = []
        for file in files:
            file = file.replace('\'','')
            with open('./jsonFiles/'+file+'.json') as f:
                data.append(json.load(f))
        return data

    #V02
#***********LISTE DER TABS***********
#Excel_data
#PREDUZ_FEST_C
#HAW
#PFEST
#PSTEIG
#PNULL
#DIVERS
#DIVERS2
#PREDUZ_B
#PREDUZ_C
#TELEHUB_NEIG_A
#TELEHUB_NEIG_B
#************************************

    @app.route('/files')
    def getParserJsonFileList():
        return getLastSWVersionsForAllFiles()

    @app.route('/files/<nr>')
    def getParserJsonFilesParams(nr):
        files = nr.split(',')
        data = []
        for file in files:
            fileData = []
            file = file.replace('\'','')
            parsedFile = re.match('(\d\d)(\d\d\d)(\d\d\d)', file)
            if os.path.isfile('./jsonFiles/'+parsedFile.group(0)+'.json'):
                with open('./jsonFiles/'+parsedFile.group(0)+'.json')as f:  
                    fileData.append(json.load(f))
            else:
                fileData.append({})                                                                        
            fileData = getSWDataForFile(file,fileData)
            data.append(fileData)
        return data  

    @app.route('/tabNames')
    def getTabNames():
        return list(tabList.keys())

def writePortToFile():
    with open("./js/port.js", "w") as f:
        f.write("const port = " + str(FlaskServer.port) + ";")
    
if __name__=='__main__':
    if len(sys.argv) == 2:
        FlaskServer.port = sys.argv[1]
    writePortToFile()
    FlaskServer.app.run(port=FlaskServer.port)

