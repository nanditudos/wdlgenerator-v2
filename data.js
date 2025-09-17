const data = {
	"taskDefinitions" : [
		{
			"name":"multiFileInput_S",//Single end input
			"text":"Single End",
			"inputs" : [
				{
					"name":"INPUT",
					"type":"textarea",
					"text":"File names",
					"value":""
				},
				{
					"name":"INPUT",
					"type":"input",
					"value":"INITIALIZATION"
				}
			],
			"outputs": [
				{
					"type":"output",
					"value":"RAW_FASTA",
					"array":true
				}
			]
		},
		
		{
			"name":"multiFileInput_P",//Paired end input
			"text":"Paired End",
			"inputs" : [
				{
					"name":"INPUT",
					"type":"textarea",
					"text":"File names (in pairs)",
					"value":""
				},
				{
					"name":"INPUT",
					"type":"input",
					"value":"INITIALIZATION"
				}
			],
			"outputs": [
				{
					"type":"output",
					"value":"RAW_FASTA_FORWARD",
					"access":"[0]",
					"array":true
				},
				{
					"type":"output",
					"value":"RAW_FASTA_REVERSE",
					"access":"[1]",
					"array":true
				}
			]
		},
		
		{
			"name":"FastQC_S",//Single end fastqc
			"text":"FastQC",
			"inputs" : [
				{
					"name":"INPUT",
					"type":"input",
					"value":"RAW_FASTA",
					"passed":true
				}
			],
			/*"outputs": [
				{
					"name":"OUTPUT",
					"type":"output",
					"value":"RAW_FASTA"
				}
			],*/
			"wdl": {
				"generator": {
					"inputs": [
						'String INPUT'
					],
					/*"outputs": [
						'String OUTPUT = INPUT'
					],*/
					"command": [
						'fastqc ${INPUT}'
					]
				}
			}
		},
		
		{
			"name":"FastQC_P",//Paired end fastqc
			"text":"FastQC",
			"inputs" : [
				{
					"name":"FORWARD",
					"type":"input",
					"value":"RAW_FASTA_FORWARD",
					"passed":true
				},
				{
					"name":"REVERSE",
					"type":"input",
					"value":"RAW_FASTA_REVERSE",
					"passed":true
				},
			],
			"wdl": {
				"generator": {
					"inputs": [
						'String FORWARD',
						'String REVERSE',
					],
					"command": [
						'fastqc ${FORWARD} ${REVERSE}'
					]
				}
			}
		},
		
		{
			"name":"Trimmomatic_S",//Single trimmomatic
			"text":"Trimmomatic",
			"inputs" : [
				{
					"name":"INPUT",
					"type":"input",
					"value":"RAW_FASTA"
				},
				{
					"name":"ILLUMINACLIP",
					"type":"selection",
					"value":"TruSeq3-SE:2:30:10",
					"text":"Illumina Clip",
					"options": [
						{"value":"TruSeq3-SE:2:30:10","text":"TruSeq3-SE:2:30:10"}
					]
				},
				{
					"name":"MINLEN",
					"type":"number",
					"value":"20",
					"text":"Minlen",
					"min":"16"
				},
				{
					"name":"SLIDINGWINDOW",
					"type":"number",
					"value":"4",
					"text":"Sliding Window",
					"min":"0",
					"max":"16"
				}
			],
			"outputs": [
				{
					"name":"OUTPUT",
					"type":"output",
					"value":"RAW_FASTA"
				},
				{
					"name":"UNPAIREDOUTPUT",
					"type":"output",
					"value":"RAW_FASTA_UNPAIRED"
				}
			],
			"wdl": {
				"generator": {
					"inputs": [
						'String SUMMARY = "summary.txt"',
						'String INPUT',
						'String ILLUMINACLIP',
						'String SLIDINGWINDOW',
						'String MINLEN',
						'String OUT = sub(INPUT, "\\.fastq.gz$", "\\_trimmed.fastq.gz")',
						'String UNPAIREDOUT = sub(INPUT, "\\.fastq.gz$", "\\_trimmed_unpaired.fastq.gz")'
					],
					"outputs": [
						'String OUTPUT = OUT',
						'String UNPAIREDOUTPUT = UNPAIREDOUT'
					],
					"command": [
						'trimmomatic SE -phred33 -summary ${SUMMARY} ${INPUT} ${OUT} ${UNPAIREDOUT} ILLUMINACLIP:${ILLUMINACLIP} SLIDINGWINDOW:${SLIDINGWINDOW} MINLEN:${MINLEN} 2> trimlog.txt'
					]
				}
			}
		},
		
		{
			"name":"AlignBWA_S",
			"text":"Align (BWA)",
			"inputs" : [
				{
					"name":"INPUT",
					"type":"input",
					"value":"RAW_FASTA"
				},
				{
					"name":"INPUT",
					"type":"text",
					"value":"",
					"text":"Reference genome"
				},
			],
			"outputs": [
				{
					"name":"OUTPUT",
					"type":"output",
					"value":"SAM"
				}
			],
			"wdl": {
				"generator": {
					"inputs": [
						'String INPUT',
						'String REFERENCEGENOME',
						'String OUTSAMFILE = sub(INPUT, "\\.fastq.gz$", "\\.sam")'
					],
					"outputs": [
						'String OUTPUT = "${OUTSAMFILE}'
					],
					"command": [
						'bwa mem ${REFERENCEGENOME} ${INPUT} > ${OUTSAMFILE}'
					]
				}
			}
		},
		
		{
			"name":"SamToBam",
			"text":"Sam to Bam",
			"inputs" : [
				{
					"name":"INPUT",
					"type":"input",
					"value":"SAM"
				},
			],
			"outputs": [
				{
					"name":"OUTPUT",
					"type":"output",
					"value":"BAM"
				}
			],
			"wdl": {
				"generator": {
					"inputs": [
						'String INPUT',
						'String outputFile = sub(INPUT, "\\.sam$", ".bam")',
					],
					"outputs": [
						'String OUTPUT = "${outputFile}"'
					],
					"command": [
						'samtools view -b -S ${INPUT} > ${outputFile}'
					]
				}
			}
		},
		
		{
			"name":"SortBam",
			"text":"Sort Bam",
			"inputs" : [
				{
					"name":"INPUT",
					"type":"input",
					"value":"BAM"
				},
			],
			"outputs": [
				{
					"name":"OUTPUT",
					"type":"output",
					"value":"BAM_SORTED"
				}
			],
			"wdl": {
				"generator": {
					"inputs": [
						'String INPUT',
						'String outputFile = sub(bamFileInput, "\\.bam$", "_sorted.bam")',
					],
					"outputs": [
						'String OUTPUT = "${outputFile}"'
					],
					"command": [
						'samtools sort ${INPUT} -o ${outputFile}'
					]
				}
			}
		},
		
		{
			"name":"SortBam",
			"text":"Sort Bam",
			"inputs" : [
				{
					"name":"INPUT",
					"type":"input",
					"value":"BAM_SORTED"
				},
			],
			"outputs": [
				{
					"name":"OUTPUT",
					"type":"output",
					"value":"BAI"
				},
				{
					"name":"OUTPUT_BAM",
					"type":"output",
					"value":"BAM_SORTED_INDEXED"
				},
			],
			"wdl": {
				"generator": {
					"inputs": [
						'String INPUT',
						'String outputFile = sub(inputBamFile, "\\.bam$", ".bai")',
					],
					"outputs": [
						'String OUTPUT = "${outputFile}"',
						'String OUTPUT_BAM = INPUT'
					],
					"command": [
						'samtools index -b ${INPUT} ${outputFile}'
					]
				}
			}
		},
	]
}
